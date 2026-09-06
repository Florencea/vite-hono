import { verify as argonVerify } from "argon2";
import type { Context, MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";
import { COOKIE_NAME, COOKIE_SECRET, IS_PRODUCTION, SESSION_TTL } from "./config.js";

export interface SessionData {
  id: number;
  account: string;
  exp?: number;
}

export async function getSession(c: Context): Promise<SessionData | null> {
  const token = getCookie(c, COOKIE_NAME);
  if (!token) return null;

  try {
    const payload = await verify(token, COOKIE_SECRET, "HS256");
    if (!payload || typeof payload !== "object") return null;
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

export async function setSession(c: Context, data: Omit<SessionData, "exp">): Promise<void> {
  const payload: SessionData = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL,
  };

  const token = await sign(payload as unknown as Record<string, unknown>, COOKIE_SECRET, "HS256");

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

export const authorizedMiddleware: MiddlewareHandler = async (c, next) => {
  const session = await getSession(c);
  if (!session?.id) {
    throw new HTTPException(401, { message: "UNAUTHORIZED" });
  }
  c.set("session", session);
  await next();
};

export async function verifyPassword(
  hashedPassword: string,
  plainPassword: string,
): Promise<boolean> {
  try {
    return await argonVerify(hashedPassword, plainPassword);
  } catch {
    return false;
  }
}
