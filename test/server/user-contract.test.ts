import { expect, test } from "vitest";
import app from "../../src/server/app.ts";

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

test("User Contract: CRUD lifecycle and Role/Department assignment", async () => {
  const adminCookie = await loginAs("admin", "string");

  // 1. Create User
  const createUserRes = await app.request("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      account: "new_sales_member",
      password: "password123",
      name: "業務新人",
      employeeNo: "SALES001",
      title: "業務專員",
      departmentId: 1,
      roleIds: [2],
    }),
  });
  expect(createUserRes.status).toBe(200);
  const user = (await createUserRes.json()) as {
    id: number;
    account: string;
    employeeNo: string;
    roleIds: number[];
  };
  expect(user.account).toBe("new_sales_member");
  expect(user.employeeNo).toBe("SALES001");
  expect(user.roleIds).toEqual([2]);

  // 2. Duplicate account fails
  const dupUserRes = await app.request("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      account: "new_sales_member",
      password: "password123",
    }),
  });
  expect(dupUserRes.status).toBe(400);

  // 3. Update User
  const updateUserRes = await app.request(`/api/users/${user.id.toString()}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      title: "資深業務專員",
      status: "active",
    }),
  });
  expect(updateUserRes.status).toBe(200);
  const updatedUser = (await updateUserRes.json()) as { title: string };
  expect(updatedUser.title).toBe("資深業務專員");

  // 4. Delete User
  const deleteUserRes = await app.request(`/api/users/${user.id.toString()}`, {
    method: "DELETE",
    headers: { Cookie: adminCookie },
  });
  expect(deleteUserRes.status).toBe(200);
});

test("User Contract: Data Scope Filtering (SELF vs ALL)", async () => {
  const adminCookie = await loginAs("admin", "string");

  // Create an employee with SELF data scope
  const createEmpRes = await app.request("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      account: "self_scope_employee",
      password: "password123",
      name: "自限使用者",
      roleIds: [3], // employee role (dataScope: SELF)
    }),
  });
  expect(createEmpRes.status).toBe(200);

  // Login as this employee
  const employeeCookie = await loginAs("self_scope_employee", "password123");
  expect(employeeCookie).toBeTruthy();

  // Employee queries /api/users -> should only see themselves
  const empListRes = await app.request("/api/users", {
    method: "GET",
    headers: { Cookie: employeeCookie },
  });
  expect(empListRes.status).toBe(200);
  const empListJson = (await empListRes.json()) as {
    items: { account: string }[];
  };
  expect(empListJson.items.length).toBe(1);
  expect(empListJson.items[0].account).toBe("self_scope_employee");

  // Admin queries /api/users -> sees all users
  const adminListRes = await app.request("/api/users", {
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  const adminListJson = (await adminListRes.json()) as {
    items: { account: string }[];
  };
  expect(adminListJson.items.length).toBeGreaterThan(1);
});

test("User Contract: System admin cannot be deleted", async () => {
  const adminCookie = await loginAs("admin", "string");

  const listRes = await app.request("/api/users", {
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  const listJson = (await listRes.json()) as {
    items: { id: number; account: string; isSystem: boolean }[];
  };
  const adminUser = listJson.items.find((u) => u.account === "admin");
  expect(adminUser).toBeDefined();
  if (!adminUser) {
    throw new Error("Admin user not found");
  }
  expect(adminUser.isSystem).toBe(true);

  const deleteAdminRes = await app.request(
    `/api/users/${adminUser.id.toString()}`,
    {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    },
  );
  expect(deleteAdminRes.status).toBe(400);
  const deleteJson = (await deleteAdminRes.json()) as { error: string };
  expect(deleteJson.error).toBeTruthy();
});
