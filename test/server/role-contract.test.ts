import { expect, test } from "vitest";
import app from "../../src/server/app.ts";

async function getAdminCookie(): Promise<string> {
  const res = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: "admin", password: "string" }),
  });
  const cookieHeader = res.headers.get("set-cookie");
  const tokenMatch = /vite_hono_session=([^;]+)/.exec(cookieHeader ?? "");
  return tokenMatch ? `vite_hono_session=${tokenMatch[1]}` : "";
}

test("Role Contract: CRUD lifecycle, custom dataScope, and system role protection", async () => {
  const adminCookie = await getAdminCookie();

  // 1. List permissions
  const permsRes = await app.request("/api/permissions", {
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  expect(permsRes.status).toBe(200);
  const permsJson = (await permsRes.json()) as {
    items: { id: number; code: string }[];
  };
  expect(permsJson.items.length).toBeGreaterThan(0);
  const samplePermIds = permsJson.items.slice(0, 2).map((p) => p.id);

  // 2. Create custom role with CUSTOM dataScope
  const createRoleRes = await app.request("/api/roles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      code: "custom_auditor",
      name: "稽核專員",
      description: "內部查核與稽核角色",
      dataScope: "CUSTOM",
      permissionIds: samplePermIds,
      departmentIds: [1],
    }),
  });
  expect(createRoleRes.status).toBe(200);
  const createdRole = (await createRoleRes.json()) as {
    id: number;
    code: string;
    permissionIds: number[];
    departmentIds: number[];
  };
  expect(createdRole.code).toBe("custom_auditor");
  expect(createdRole.permissionIds).toEqual(samplePermIds);
  expect(createdRole.departmentIds).toEqual([1]);

  // 3. Duplicate role code fails with 400
  const dupRoleRes = await app.request("/api/roles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      code: "custom_auditor",
      name: "重複的角色",
      dataScope: "SELF",
    }),
  });
  expect(dupRoleRes.status).toBe(400);

  // 4. Update role
  const updateRoleRes = await app.request(
    `/api/roles/${createdRole.id.toString()}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        name: "進階稽核專員",
        dataScope: "ALL",
      }),
    },
  );
  expect(updateRoleRes.status).toBe(200);
  const updatedRole = (await updateRoleRes.json()) as {
    name: string;
    dataScope: string;
  };
  expect(updatedRole.name).toBe("進階稽核專員");
  expect(updatedRole.dataScope).toBe("ALL");

  // 5. System role (super_admin) cannot be deleted
  const rolesListRes = await app.request("/api/roles", {
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  const rolesList = (await rolesListRes.json()) as {
    items: { id: number; code: string; isSystem: boolean }[];
  };
  const superAdmin = rolesList.items.find((r) => r.code === "super_admin");
  expect(superAdmin).toBeDefined();

  if (!superAdmin) {
    throw new Error("super_admin not found");
  }

  const failDeleteSystemRole = await app.request(
    `/api/roles/${superAdmin.id.toString()}`,
    {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    },
  );
  expect(failDeleteSystemRole.status).toBe(400);

  // 6. Delete custom role succeeds
  const deleteCustomRole = await app.request(
    `/api/roles/${createdRole.id.toString()}`,
    {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    },
  );
  expect(deleteCustomRole.status).toBe(200);
});
