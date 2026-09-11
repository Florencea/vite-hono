import { compare, hash } from "bcrypt-ts";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import { COOKIE_SECRET } from "./config.ts";

export const COOKIE_NAME = "vite_hono_session";
const SESSION_TTL = 604800;
const BCRYPT_SALT_ROUNDS = 10;

export interface SessionData {
  id: number;
  account: string;
  exp?: number;
}

export async function getSession(c: Context): Promise<SessionData | null> {
  const token = getCookie(c, COOKIE_NAME);
  if (!token) return null;

  try {
    const payload = (await verify(token, COOKIE_SECRET, "HS256")) as unknown;
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

  const token = await sign(
    payload as unknown as Record<string, unknown>,
    COOKIE_SECRET,
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
