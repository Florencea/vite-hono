import { afterEach, expect, test } from "vitest";
import { renderAppAt } from "./test-utils";

const originalFetch = window.fetch.bind(window);

afterEach(() => {
  window.fetch = originalFetch;
});

function mockRoleEnvironment() {
  let dispatchedPayload: Record<string, unknown> | null = null;
  let dispatchedUrl: string | null = null;
  let dispatchedMethod: string | null = null;

  const roles = [
    {
      id: 1,
      code: "super_admin",
      name: "超級管理員",
      description: "系統全權管理員",
      dataScope: "ALL",
      sort: 1,
      isSystem: true,
      permissionIds: [1, 2],
      departmentIds: [],
    },
    {
      id: 2,
      code: "dept_manager",
      name: "部門主管",
      description: "管理部門",
      dataScope: "DEPT_AND_CHILD",
      sort: 2,
      isSystem: false,
      permissionIds: [1],
      departmentIds: [],
    },
  ];

  const permissions = [
    {
      id: 1,
      code: "system:dept:read",
      name: "查看部門",
      type: "menu",
      sort: 1,
      parentId: null,
    },
    {
      id: 2,
      code: "system:role:read",
      name: "查看角色",
      type: "menu",
      sort: 2,
      parentId: null,
    },
  ];

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    const method = init?.method ?? "GET";

    if (url.includes("/api/auth/getUserInfo")) {
      return new Response(
        JSON.stringify({
          success: true,
          id: 1,
          account: "admin",
          name: "系統管理員",
          employeeNo: "EMP001",
          title: "管理員",
          departmentId: 1,
          roles: ["super_admin"],
          permissions: [
            "system:role:read",
            "system:role:create",
            "system:role:update",
            "system:role:delete",
          ],
          dataScopes: ["ALL"],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (url.includes("/api/roles") && method === "GET") {
      return new Response(JSON.stringify({ items: roles }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("/api/permissions")) {
      return new Response(JSON.stringify({ items: permissions }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("/api/departments")) {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (
      url.includes("/api/roles") &&
      (method === "POST" || method === "PUT" || method === "DELETE")
    ) {
      dispatchedUrl = url;
      dispatchedMethod = method;
      if (init?.body && typeof init.body === "string") {
        try {
          dispatchedPayload = JSON.parse(init.body) as Record<string, unknown>;
        } catch {
          dispatchedPayload = null;
        }
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return originalFetch(input, init);
  };

  return {
    getDispatched: () => ({
      url: dispatchedUrl,
      method: dispatchedMethod,
      payload: dispatchedPayload,
    }),
  };
}

test("E2E Role Flow: renders role list and displays data scope tags", async () => {
  mockRoleEnvironment();
  const screen = await renderAppAt("/roles");

  const superAdminText = screen.getByText("超級管理員");
  await expect.element(superAdminText).toBeInTheDocument();

  const deptMgrText = screen.getByText("部門主管");
  await expect.element(deptMgrText).toBeInTheDocument();

  // Assert system role has System tag
  const systemTag = screen.getByText("System");
  await expect.element(systemTag).toBeInTheDocument();
});

test("E2E Role Flow: creates a new role with custom dataScope via drawer", async () => {
  const tracker = mockRoleEnvironment();
  const screen = await renderAppAt("/roles");

  // Click Create Role button
  const createBtn = screen.getByRole("button", {
    name: /Create Role|新增角色/i,
  });
  await createBtn.click();

  // Drawer dialog should appear
  const drawer = screen.getByRole("dialog");
  await expect.element(drawer).toBeVisible();

  // Fill role code and name
  const codeInput = screen.getByLabelText(/Role Code|角色代碼/i);
  await codeInput.fill("auditor");

  const nameInput = screen.getByLabelText(/Role Name|角色名稱/i);
  await nameInput.fill("稽核主管");

  // Select Data Scope radio
  const scopeRadio = drawer.getByLabelText(
    /Department & Children|本部門及以下數據/i,
  );
  await scopeRadio.click();

  // Click Save button in drawer
  const saveBtn = drawer.getByRole("button", { name: /Save|保 存|儲存/i });
  await saveBtn.click();

  // Verify RPC request
  expect(tracker.getDispatched().method).toBe("POST");
  expect(tracker.getDispatched().url).toContain("/api/roles");
  expect(tracker.getDispatched().payload).toMatchObject({
    code: "auditor",
    name: "稽核主管",
    dataScope: "DEPT_AND_CHILD",
  });
});

test("E2E Role Flow: edits existing role name via drawer", async () => {
  const tracker = mockRoleEnvironment();
  const screen = await renderAppAt("/roles");

  // Wait for table to load
  const superAdminText = screen.getByText("超級管理員");
  await expect.element(superAdminText).toBeInTheDocument();

  // Click edit button for role
  const editButtons = screen
    .getByRole("main")
    .getByRole("button", { name: /Edit|編輯/i });
  await editButtons.first().click();

  const drawer = screen.getByRole("dialog");
  await expect.element(drawer).toBeVisible();

  const nameInput = screen.getByLabelText(/Role Name|角色名稱/i);
  await nameInput.fill("高級部門主管");

  const saveBtn = drawer.getByRole("button", { name: /Save|保 存|儲存/i });
  await saveBtn.click();

  expect(tracker.getDispatched().method).toBe("PUT");
  expect(tracker.getDispatched().url).toContain("/api/roles/1");
  expect(tracker.getDispatched().payload).toMatchObject({
    name: "高級部門主管",
  });
});

test("E2E Role Flow: deletes custom role with confirmation while system role is protected", async () => {
  const tracker = mockRoleEnvironment();
  const screen = await renderAppAt("/roles");

  // Wait for table to load
  const deptMgrText = screen.getByText("部門主管");
  await expect.element(deptMgrText).toBeInTheDocument();

  // System role (row 1) must not have a delete button
  const deleteButtons = screen
    .getByRole("main")
    .getByRole("button", { name: /Delete|刪除/i });
  // There should only be 1 delete button in the table because role 1 is a system role
  expect(deleteButtons.all()).toHaveLength(1);

  // Click delete on the custom role
  await deleteButtons.first().click();

  // Confirm popconfirm
  const confirmBtn = screen.getByRole("tooltip").getByRole("button", {
    name: /OK|確定|Yes/i,
  });
  await confirmBtn.click();

  expect(tracker.getDispatched().method).toBe("DELETE");
  expect(tracker.getDispatched().url).toContain("/api/roles/2");
});
