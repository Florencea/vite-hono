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
