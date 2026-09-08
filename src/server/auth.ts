import { argon2id, argon2Verify } from "hash-wasm";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import {
  COOKIE_NAME,
  COOKIE_SECRET,
  IS_PRODUCTION,
  SESSION_TTL,
} from "./config.ts";

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

  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export function deleteSession(c: Context): void {
  deleteCookie(c, COOKIE_NAME, {
    path: "/",
    secure: IS_PRODUCTION,
  });
}

/**
 * Hashes a plain password using WebAssembly Argon2id (OWASP recommended standard).
 * Output format is the standard PHC string: $argon2id$v=19$m=16384,t=2,p=1$...
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return await argon2id({
    password: plainPassword,
    salt,
    parallelism: 1,
    iterations: 2,
    memorySize: 16384, // 16 MB memory-hard
    hashLength: 32,
    outputType: "encoded",
  });
}

/**
 * Verifies a plain password against a standard Argon2 encoded hash in constant time.
 */
export async function verifyPassword(
  hashedPassword: string,
  plainPassword: string,
): Promise<boolean> {
  try {
    return await argon2Verify({
      password: plainPassword,
      hash: hashedPassword,
    });
  } catch {
    return false;
  }
}
