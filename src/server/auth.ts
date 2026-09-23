import { compare, hash } from "bcrypt-ts";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import { COOKIE_SECRET } from "./config.ts";
import { getDb } from "./database/index.ts";
import { systemSettings } from "./database/schema.ts";

export const COOKIE_NAME = "vite_hono_session";
const SESSION_TTL = 604800;
const BCRYPT_SALT_ROUNDS = 10;

let cachedCookieSecret: string | undefined;

/**
 * Resolves the cookie signing secret with a multi-tiered hierarchy:
 * 1. Explicit `COOKIE_SECRET` environment variable (highest precedence).
 * 2. In-memory cache hit (zero database overhead).
 * 3. Database `systemSettings` persistent lookup.
 * 4. Automatic generation of a 64-character cryptographically secure secret persisted to DB.
 * 5. Safe fallback for early bootstrap or offline database states.
 */
export async function getCookieSecret(c?: Context): Promise<string> {
  if (process.env.COOKIE_SECRET?.trim()) {
    return process.env.COOKIE_SECRET.trim();
  }

  if (cachedCookieSecret) {
    return cachedCookieSecret;
  }

  try {
    const database = getDb(c);
    const existing = await database
      .select({ value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, "cookie_secret"))
      .get();

    if (existing?.value) {
      cachedCookieSecret = existing.value;
      return existing.value;
    }

    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    const newSecret = Array.from(buffer)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    await database
      .insert(systemSettings)
      .values({
        key: "cookie_secret",
        value: newSecret,
        description: "Auto-generated JWT session cookie signing secret",
      })
      .onConflictDoNothing();

    const finalSetting = await database
      .select({ value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, "cookie_secret"))
      .get();

    cachedCookieSecret = finalSetting?.value ?? newSecret;
    return cachedCookieSecret;
  } catch {
    return COOKIE_SECRET;
  }
}

export interface SessionData {
  id: number;
  account: string;
  exp?: number;
}

export async function getSession(c: Context): Promise<SessionData | null> {
  const token = getCookie(c, COOKIE_NAME);
  if (!token) return null;

  try {
    const secret = await getCookieSecret(c);
    const payload = (await verify(token, secret, "HS256")) as unknown;
    if (!payload || typeof payload !== "object") return null;
    return payload as SessionData;
  } catch {
    return null;
  }
}

export async function setSession(
  c: Context,
  data: Omit<SessionData, "exp">,
): Promise<void> {
  const payload: SessionData = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL,
  };

  const secret = await getCookieSecret(c);
  const token = await sign(
    payload as unknown as Record<string, unknown>,
    secret,
    "HS256",
  );

  const isProduction = process.env.NODE_ENV === "production";
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export function deleteSession(c: Context): void {
  const isProduction = process.env.NODE_ENV === "production";
  deleteCookie(c, COOKIE_NAME, {
    path: "/",
    secure: isProduction,
  });
}

/**
 * Hashes a plain password using bcrypt (industry standard).
 * Uses pure-TS bcrypt-ts for universal compatibility across Node.js, Docker, and Cloudflare Workers.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return await hash(plainPassword, BCRYPT_SALT_ROUNDS);
}

/**
 * Verifies a plain password against the stored bcrypt hash in constant time.
 */
export async function verifyPassword(
  hashedPassword: string,
  plainPassword: string,
): Promise<boolean> {
  return await compare(plainPassword, hashedPassword);
}
