import { afterEach, expect, test } from "vitest";
import { renderAppAt } from "./test-utils";

const originalFetch = window.fetch.bind(window);

afterEach(() => {
  window.fetch = originalFetch;
});

function mockUserEnvironment() {
  let dispatchedPayload: Record<string, unknown> | null = null;
  let dispatchedUrl: string | null = null;
  let dispatchedMethod: string | null = null;

  const users = [
    {
      id: 1,
      uid: "u-admin",
      account: "admin",
      name: "系統管理員",
      employeeNo: "ADM001",
      title: "超級管理員",
      status: "active" as const,
      departmentId: 1,
      reportsToId: null,
      roleIds: [1],
      isSystem: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      uid: "u-001",
      account: "emp_alice",
      name: "愛麗絲",
      employeeNo: "EMP001",
      title: "工程師",
      status: "active" as const,
      departmentId: 1,
      reportsToId: null,
      roleIds: [2],
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const departments = [
    {
      id: 1,
      name: "總部",
      parentId: null,
      path: ",1,",
      sort: 1,
      leaderId: null,
    },
  ];

  const roles = [
    {
      id: 1,
      code: "super_admin",
      name: "超級管理員",
      description: "全系統管理",
      dataScope: "ALL" as const,
      sort: 1,
      isSystem: true,
    },
    {
      id: 2,
      code: "developer",
      name: "研發工程師",
      description: "研發職能",
      dataScope: "SELF" as const,
      sort: 2,
      isSystem: false,
    },
  ];

  const permissions = [
    {
      id: 1,
      code: "system:user:read",
      name: "查看使用者",
      type: "menu" as const,
      parentId: null,
      sort: 1,
    },
    {
      id: 2,
      code: "system:user:create",
      name: "新增使用者",
      type: "button" as const,
      parentId: 1,
      sort: 2,
    },
    {
      id: 3,
      code: "system:user:update",
      name: "編輯使用者",
      type: "button" as const,
      parentId: 1,
      sort: 3,
    },
    {
      id: 4,
      code: "system:user:delete",
      name: "刪除使用者",
      type: "button" as const,
      parentId: 1,
      sort: 4,
    },
  ];

  const currentUser = {
    success: true,
    id: 1,
    uid: "u-admin",
    account: "admin",
    name: "系統管理員",
    employeeNo: "ADM001",
    title: "管理員",
    status: "active" as const,
    departmentId: 1,
    reportsToId: null,
    roleIds: [1],
    isSystem: true,
    roles: ["super_admin"],
    permissions: [
      "system:user:read",
      "system:user:create",
      "system:user:update",
      "system:user:delete",
    ],
    dataScopes: ["ALL"],
  };

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    const method = init?.method?.toUpperCase() ?? "GET";

    if (url.includes("/api/auth/getUserInfo")) {
      return new Response(JSON.stringify(currentUser), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("/api/departments")) {
      return new Response(JSON.stringify({ items: departments }), {
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

    if (url.includes("/api/roles")) {
      return new Response(JSON.stringify({ items: roles }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (
      url.includes("/api/users") &&
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

    if (url.includes("/api/users") && method === "GET") {
      return new Response(JSON.stringify({ items: users }), {
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

test("E2E User Flow: renders user table and employee details", async () => {
  mockUserEnvironment();
  const screen = await renderAppAt("/user");

  const accountText = screen.getByText("emp_alice");
  await expect.element(accountText).toBeInTheDocument();

  const employeeNoText = screen.getByText("EMP001");
  await expect.element(employeeNoText).toBeInTheDocument();

  const roleTag = screen.getByText("研發工程師");
  await expect.element(roleTag).toBeInTheDocument();
});

test("E2E User Flow: onboards a new employee via modal", async () => {
  const tracker = mockUserEnvironment();
  const screen = await renderAppAt("/user");

  const createBtn = screen.getByRole("button", {
    name: /Create User|新增人員/i,
  });
  await createBtn.click();

  const modal = screen.getByRole("dialog");
  await expect.element(modal).toBeVisible();

  // Fill employee onboarding details
  const accountInput = screen.getByLabelText(/Account|帳號/i);
  await accountInput.fill("emp_david");

  const passwordInput = screen.getByLabelText(/Password|密碼/i);
  await passwordInput.fill("password123");

  const nameInput = screen.getByLabelText(/^Name$|^姓名$/i);
  await nameInput.fill("大衛");

  const employeeNoInput = screen.getByLabelText(/Employee No|工號/i);
  await employeeNoInput.fill("EMP008");

  const titleInput = screen.getByLabelText(/^Title$|^職稱$/i);
  await titleInput.fill("高級架構師");

  const submitBtn = modal.getByRole("button", { name: /OK|確 定/i });
  await submitBtn.click();

  expect(tracker.getDispatched().method).toBe("POST");
  expect(tracker.getDispatched().url).toContain("/api/users");
  expect(tracker.getDispatched().payload).toMatchObject({
    account: "emp_david",
    name: "大衛",
    employeeNo: "EMP008",
    title: "高級架構師",
    status: "active",
  });
});

test("E2E User Flow: edits existing user job title and profile", async () => {
  const tracker = mockUserEnvironment();
  const screen = await renderAppAt("/user");

  // Wait for user record to appear
  const accountText = screen.getByText("emp_alice");
  await expect.element(accountText).toBeInTheDocument();

  // Click edit button for emp_alice (second user row)
  const editButtons = screen
    .getByRole("main")
    .getByRole("button", { name: /Edit|編輯/i });
  await editButtons.all()[1].click();

  const modal = screen.getByRole("dialog");
  await expect.element(modal).toBeVisible();

  const titleInput = screen.getByLabelText(/^Title$|^職稱$/i);
  await titleInput.fill("技術總監");

  const submitBtn = modal.getByRole("button", { name: /OK|確 定/i });
  await submitBtn.click();

  expect(tracker.getDispatched().method).toBe("PUT");
  expect(tracker.getDispatched().url).toContain("/api/users/2");
  expect(tracker.getDispatched().payload).toMatchObject({
    title: "技術總監",
  });
});

test("E2E User Flow: deletes custom user record with Popconfirm while admin is protected", async () => {
  const tracker = mockUserEnvironment();
  const screen = await renderAppAt("/user");

  const accountText = screen.getByText("emp_alice");
  await expect.element(accountText).toBeInTheDocument();

  // Admin user must not have a delete button, only emp_alice has one
  const deleteButtons = screen
    .getByRole("main")
    .getByRole("button", { name: /Delete|刪除/i });
  expect(deleteButtons.all()).toHaveLength(1);

  await deleteButtons.first().click();

  // Popconfirm tooltip
  const confirmBtn = screen.getByRole("tooltip").getByRole("button", {
    name: /OK|確定|Yes/i,
  });
  await confirmBtn.click();

  expect(tracker.getDispatched().method).toBe("DELETE");
  expect(tracker.getDispatched().url).toContain("/api/users/2");
});

test("E2E User Flow: modal refreshes form state on open, edit, and cancel", async () => {
  mockUserEnvironment();
  const screen = await renderAppAt("/user");

  // 1. Open Create modal, fill account and name, then cancel
  const createBtn = screen.getByRole("button", {
    name: /Create User|新增人員/i,
  });
  await createBtn.click();

  const modal = screen.getByRole("dialog");
  await expect.element(modal).toBeVisible();

  const accountInput = screen.getByLabelText(/Account|帳號/i);
  await accountInput.fill("temp_account");

  const nameInput = screen.getByLabelText(/^Name$|^姓名$/i);
  await nameInput.fill("暫存姓名");

  // Click Cancel button
  const cancelBtn = modal.getByRole("button", { name: /Cancel|取 消/i });
  await cancelBtn.click();
  await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();

  // 2. Re-open Create modal -> inputs must be clean / refreshed!
  await createBtn.click();
  const reOpenedModal = screen.getByRole("dialog");
  await expect.element(reOpenedModal).toBeVisible();
  const refreshedAccountInput = screen.getByLabelText(/Account|帳號/i);
  const refreshedNameInput = screen.getByLabelText(/^Name$|^姓名$/i);
  await expect.element(refreshedAccountInput).toHaveValue("");
  await expect.element(refreshedNameInput).toHaveValue("");

  // Close modal
  await reOpenedModal.getByRole("button", { name: /Cancel|取 消/i }).click();
  await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();

  // 3. Open Edit modal for user 2 (emp_alice), change title, then cancel
  const editButtons = screen
    .getByRole("main")
    .getByRole("button", { name: /Edit|編輯/i });
  await editButtons.all()[1].click();
  const editModal = screen.getByRole("dialog");
  await expect.element(editModal).toBeVisible();

  const editTitleInput = screen.getByLabelText(/^Title$|^職稱$/i);
  await expect.element(editTitleInput).toHaveValue("工程師");
  await editTitleInput.fill("修改但不保存");

  await editModal.getByRole("button", { name: /Cancel|取 消/i }).click();
  await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();

  // 4. Re-open Edit modal for same user -> must be refreshed to original "工程師"!
  await editButtons.all()[1].click();
  const reOpenedEditModal = screen.getByRole("dialog");
  await expect.element(reOpenedEditModal).toBeVisible();
  const reOpenedTitleInput = screen.getByLabelText(/^Title$|^職稱$/i);
  await expect.element(reOpenedTitleInput).toHaveValue("工程師");
});
