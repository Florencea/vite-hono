import { expect, test } from "vite-plus/test";
import app from "../../src/server/app";
import { ErrorResSchema } from "../../src/server/common/schemas";
import { UserInfoResSchema } from "../../src/server/routes/auth/auth.schema";

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
  const json = UserInfoResSchema.parse(await res.json());
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
  const notFoundJson = ErrorResSchema.parse(await notFoundRes.json());
  expect(notFoundJson.error).toBeTruthy();

  // 2. Wrong password returns 400
  const wrongPasswordRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: "admin", password: "wrong_password" }),
  });
  expect(wrongPasswordRes.status).toBe(400);
  const wrongPasswordJson = ErrorResSchema.parse(await wrongPasswordRes.json());
  expect(wrongPasswordJson.error).toBeTruthy();

  // 3. Successful login returns 200 and set-cookie
  const loginRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: "admin", password: "string" }),
  });
  expect(loginRes.status).toBe(200);
  const cookieHeader = loginRes.headers.get("set-cookie");
  expect(cookieHeader).toContain("vp_hono_session=");

  // Extract session token
  const tokenMatch = /vp_hono_session=([^;]+)/.exec(cookieHeader ?? "");
  const tokenValue = tokenMatch?.[1] ?? "";
  const sessionCookie = `vp_hono_session=${tokenValue}`;

  // 4. Authenticated getUserInfo returns success and account
  const authUserRes = await app.request("/api/auth/getUserInfo", {
    method: "GET",
    headers: { Cookie: sessionCookie },
  });
  expect(authUserRes.status).toBe(200);
  const authUserJson = UserInfoResSchema.parse(await authUserRes.json());
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

test("Server Database Initialization Contract: Auto-initializes schema and default admin", async () => {
  const { ensureDatabaseReady } = await import("../../src/server/database/init.ts");
  const { db } = await import("../../src/server/database/index.ts");
  await ensureDatabaseReady(db);

  const loginRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: "admin", password: "string" }),
  });
  expect(loginRes.status).toBe(200);
});
