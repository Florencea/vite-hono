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

test("Department Contract: CRUD lifecycle and materialized path calculation", async () => {
  const adminCookie = await getAdminCookie();

  // 1. List departments
  const listRes = await app.request("/api/departments", {
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  expect(listRes.status).toBe(200);
  const listJson = (await listRes.json()) as {
    items: { id: number; name: string }[];
  };
  expect(listJson.items.length).toBeGreaterThan(0);

  // 2. Create Top-Level Department
  const createParentRes = await app.request("/api/departments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      name: "測試一級事業群",
      sort: 50,
    }),
  });
  expect(createParentRes.status).toBe(200);
  const parentDept = (await createParentRes.json()) as {
    id: number;
    path: string;
    name: string;
  };
  expect(parentDept.path).toBe(`/${parentDept.id.toString()}/`);

  // 3. Create Child Department
  const createChildRes = await app.request("/api/departments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      name: "測試二級專案組",
      parentId: parentDept.id,
      sort: 1,
    }),
  });
  expect(createChildRes.status).toBe(200);
  const childDept = (await createChildRes.json()) as {
    id: number;
    path: string;
    parentId: number;
  };
  expect(childDept.path).toBe(`${parentDept.path}${childDept.id.toString()}/`);

  // 4. Update Department
  const updateRes = await app.request(
    `/api/departments/${childDept.id.toString()}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        name: "更新後的專案組",
      }),
    },
  );
  expect(updateRes.status).toBe(200);
  const updatedChild = (await updateRes.json()) as { name: string };
  expect(updatedChild.name).toBe("更新後的專案組");

  // 5. Deleting parent should fail because it has child departments
  const failDeleteParentRes = await app.request(
    `/api/departments/${parentDept.id.toString()}`,
    {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    },
  );
  expect(failDeleteParentRes.status).toBe(400);

  // 6. Delete child first, then delete parent
  const deleteChildRes = await app.request(
    `/api/departments/${childDept.id.toString()}`,
    {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    },
  );
  expect(deleteChildRes.status).toBe(200);

  const deleteParentRes = await app.request(
    `/api/departments/${parentDept.id.toString()}`,
    {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    },
  );
  expect(deleteParentRes.status).toBe(200);
});
