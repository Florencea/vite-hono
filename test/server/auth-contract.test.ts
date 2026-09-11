import { expect, test } from "vitest";
import app from "../../src/server/app";

test("Server Schema Contract: POST /api/auth/login validates required fields and types", async () => {
  // Empty payload fails Zod schema validation
  const emptyRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  expect(emptyRes.status).toBe(400);

  // Invalid data types fail Zod schema validation
  const invalidTypeRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: 12345, password: true }),
  });
  expect(invalidTypeRes.status).toBe(400);
});

test("Server Security Contract: POST /api/auth/logout requires session/cookieAuth", async () => {
  const res = await app.request("/api/auth/logout", {
    method: "POST",
  });
  // Without session cookie, OpenAPI guard returns 401 Unauthorized
  expect(res.status).toBe(401);
});

test("Server API Contract: GET /api/auth/getUserInfo returns schema-compliant structure without session", async () => {
  const res = await app.request("/api/auth/getUserInfo", {
    method: "GET",
  });
  expect(res.status).toBe(200);
  const json = (await res.json()) as {
    success: boolean;
    account: string | null;
  };
  expect(json.success).toBe(false);
  expect(json.account).toBeNull();
});

test("Server Integration Contract: Full login, authenticated session, and logout lifecycle", async () => {
  // 1. Non-existent user returns 400
  const notFoundRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: "unknown_user", password: "any" }),
  });
  expect(notFoundRes.status).toBe(400);
  const notFoundJson = (await notFoundRes.json()) as { error: string };
  expect(notFoundJson.error).toBeTruthy();

  // 2. Wrong password returns 400
  const wrongPasswordRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: "admin", password: "wrong_password" }),
  });
  expect(wrongPasswordRes.status).toBe(400);
  const wrongPasswordJson = (await wrongPasswordRes.json()) as {
    error: string;
  };
  expect(wrongPasswordJson.error).toBeTruthy();

  // 3. Successful login returns 200 and set-cookie
  const loginRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: "admin", password: "string" }),
  });
  expect(loginRes.status).toBe(200);
  const cookieHeader = loginRes.headers.get("set-cookie");
  expect(cookieHeader).toContain("vite_hono_session=");

  // Extract session token
  const tokenMatch = /vite_hono_session=([^;]+)/.exec(cookieHeader ?? "");
  expect(tokenMatch).toBeTruthy();
  const tokenValue = tokenMatch ? tokenMatch[1] : "";
  const sessionCookie = `vite_hono_session=${tokenValue}`;

  // 4. Authenticated getUserInfo returns success and account
  const authUserRes = await app.request("/api/auth/getUserInfo", {
    method: "GET",
    headers: { Cookie: sessionCookie },
  });
  expect(authUserRes.status).toBe(200);
  const authUserJson = (await authUserRes.json()) as {
    success: boolean;
    account: string | null;
  };
  expect(authUserJson.success).toBe(true);
  expect(authUserJson.account).toBe("admin");

  // 5. Authenticated logout returns 200 and clears session
  const logoutRes = await app.request("/api/auth/logout", {
    method: "POST",
    headers: { Cookie: sessionCookie },
  });
  expect(logoutRes.status).toBe(200);
  const clearCookieHeader = logoutRes.headers.get("set-cookie");
  expect(clearCookieHeader).toContain("Max-Age=0");
});
