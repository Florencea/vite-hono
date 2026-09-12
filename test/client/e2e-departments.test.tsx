import { afterEach, expect, test } from "vitest";
import { renderAppAt } from "./test-utils";

const originalFetch = window.fetch.bind(window);

afterEach(() => {
  window.fetch = originalFetch;
});

function mockDepartmentEnvironment(options?: {
  initialDepartments?: {
    id: number;
    name: string;
    parentId: number | null;
    path: string;
    sort: number;
    leaderId: number | null;
  }[];
}) {
  let dispatchedPayload: Record<string, unknown> | null = null;
  let dispatchedUrl: string | null = null;
  let dispatchedMethod: string | null = null;

  const departments = options?.initialDepartments ?? [
    {
      id: 1,
      name: "總部",
      parentId: null,
      path: ",1,",
      sort: 1,
      leaderId: null,
    },
    {
      id: 2,
      name: "研發部",
      parentId: 1,
      path: ",1,2,",
      sort: 1,
      leaderId: null,
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
            "system:dept:read",
            "system:dept:create",
            "system:dept:update",
            "system:dept:delete",
          ],
          dataScopes: ["ALL"],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (url.includes("/api/departments") && method === "GET") {
      return new Response(JSON.stringify({ items: departments }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (
      url.includes("/api/departments") &&
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

test("E2E Department Flow: renders department hierarchy tree", async () => {
  mockDepartmentEnvironment();
  const screen = await renderAppAt("/departments");

  const rootDept = screen.getByText("總部");
  await expect.element(rootDept).toBeInTheDocument();

  // Expand the root row to reveal the child department
  const expandBtn = screen.getByRole("button", { name: /Expand row/i });
  await expandBtn.click();

  const childDept = screen.getByText("研發部");
  await expect.element(childDept).toBeInTheDocument();
});

test("E2E Department Flow: creates a new top-level department via modal", async () => {
  const tracker = mockDepartmentEnvironment();
  const screen = await renderAppAt("/departments");

  // Click Create Department button
  const createBtn = screen.getByRole("button", {
    name: /Create Department|新增部門/i,
  });
  await createBtn.click();

  // Modal dialog should open
  const modal = screen.getByRole("dialog");
  await expect.element(modal).toBeVisible();

  // Fill department name
  const nameInput = screen.getByLabelText(/Department Name|部門名稱/i);
  await nameInput.fill("行銷企劃部");

  // Click OK in modal
  const submitBtn = modal.getByRole("button", { name: /OK|確 定/i });
  await submitBtn.click();

  // Verify RPC wire request
  expect(tracker.getDispatched().method).toBe("POST");
  expect(tracker.getDispatched().url).toContain("/api/departments");
  expect(tracker.getDispatched().payload).toMatchObject({
    name: "行銷企劃部",
    parentId: null,
  });
});

test("E2E Department Flow: edits existing department", async () => {
  const tracker = mockDepartmentEnvironment();
  const screen = await renderAppAt("/departments");

  // Click Edit on the second department row
  const editButtons = screen
    .getByRole("main")
    .getByRole("button", { name: /Edit|編輯/i });
  // Click the first edit button
  await editButtons.first().click();

  const modal = screen.getByRole("dialog");
  await expect.element(modal).toBeVisible();

  const nameInput = screen.getByLabelText(/Department Name|部門名稱/i);
  await nameInput.fill("總部辦公室");

  const submitBtn = modal.getByRole("button", { name: /OK|確 定/i });
  await submitBtn.click();

  expect(tracker.getDispatched().method).toBe("PUT");
  expect(tracker.getDispatched().url).toContain("/api/departments/1");
  expect(tracker.getDispatched().payload).toMatchObject({
    name: "總部辦公室",
  });
});

test("E2E Department Flow: deletes department with Popconfirm confirmation", async () => {
  const tracker = mockDepartmentEnvironment();
  const screen = await renderAppAt("/departments");

  const deleteButtons = screen
    .getByRole("main")
    .getByRole("button", { name: /Delete|刪除/i });
  await deleteButtons.first().click();

  // Popconfirm appears
  const confirmBtn = screen.getByRole("tooltip").getByRole("button", {
    name: /OK|確定|Yes/i,
  });
  await confirmBtn.click();

  expect(tracker.getDispatched().method).toBe("DELETE");
  expect(tracker.getDispatched().url).toContain("/api/departments/1");
});
