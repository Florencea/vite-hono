import { expect, test } from "vitest";
import app from "../../src/server/app.ts";
import { db } from "../../src/server/database/index.ts";
import { userRoles, users } from "../../src/server/database/schema.ts";
import { hashPassword } from "../../src/server/auth.ts";

async function loginAs(
  account: string,
  password = "password123",
): Promise<string> {
  const res = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account, password }),
  });
  const cookieHeader = res.headers.get("set-cookie");
  const tokenMatch = /vite_hono_session=([^;]+)/.exec(cookieHeader ?? "");
  return tokenMatch ? `vite_hono_session=${tokenMatch[1]}` : "";
}

test("Permission Guard: Unauthenticated requests to protected endpoints return 401 Unauthorized", async () => {
  const deptRes = await app.request("/api/departments", { method: "GET" });
  expect(deptRes.status).toBe(401);

  const roleRes = await app.request("/api/roles", { method: "GET" });
  expect(roleRes.status).toBe(401);

  const userRes = await app.request("/api/users", { method: "GET" });
  expect(userRes.status).toBe(401);
});

test("Permission Guard: Super admin bypasses all code checks and accesses protected endpoints", async () => {
  const adminCookie = await loginAs("admin", "string");
  expect(adminCookie).toBeTruthy();

  const deptRes = await app.request("/api/departments", {
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  expect(deptRes.status).toBe(200);

  const roleRes = await app.request("/api/roles", {
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  expect(roleRes.status).toBe(200);

  const userRes = await app.request("/api/users", {
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  expect(userRes.status).toBe(200);
});

test("Permission Guard: Employee role without system:dept:create returns 403 Forbidden", async () => {
  // Create a limited test employee user
  const employeeRole = await db.query.roles.findFirst({
    where: { code: "employee" },
  });
  expect(employeeRole).toBeDefined();

  const passwordHash = await hashPassword("password123");
  const insertedUser = await db
    .insert(users)
    .values({
      account: "test_employee_guard",
      password: passwordHash,
      name: "測試員工",
    })
    .returning();

  const employeeUser = insertedUser[0];
  if (!employeeRole) {
    throw new Error("Employee role not found");
  }
  await db.insert(userRoles).values({
    userId: employeeUser.id,
    roleId: employeeRole.id,
  });

  const employeeCookie = await loginAs("test_employee_guard", "password123");
  expect(employeeCookie).toBeTruthy();

  // Employee has system:user:read, so reading users returns 200
  const userListRes = await app.request("/api/users", {
    method: "GET",
    headers: { Cookie: employeeCookie },
  });
  expect(userListRes.status).toBe(200);

  // Employee lacks system:dept:create -> returns 403 Forbidden
  const createDeptRes = await app.request("/api/departments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: employeeCookie,
    },
    body: JSON.stringify({ name: "未經授權部門" }),
  });
  expect(createDeptRes.status).toBe(403);
  const json = (await createDeptRes.json()) as { error: string };
  expect(json.error).toBeTruthy();
});
