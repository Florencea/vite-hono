import { afterEach, expect, test } from "vitest";
import { renderAppAt } from "./test-utils";

const originalFetch = window.fetch.bind(window);

afterEach(() => {
  window.fetch = originalFetch;
});

function mockAuthAndApis(options: {
  roles?: string[];
  permissions?: string[];
  account?: string;
}) {
  const { roles = [], permissions = [], account = "test_user" } = options;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    if (url.includes("/api/auth/getUserInfo")) {
      return new Response(
        JSON.stringify({
          success: true,
          id: 10,
          account,
          name: "Test User",
          employeeNo: "EMP999",
          title: "Engineer",
          departmentId: 1,
          roles,
          permissions,
          dataScopes: ["SELF"],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (url.includes("/api/roles")) {
      return new Response(
        JSON.stringify({
          items: [
            {
              id: 1,
              name: "Manager",
              code: "manager",
              dataScope: "DEPT",
              status: 1,
              description: "Manager role",
              isSystem: 0,
              permissionIds: [],
              departmentIds: [],
            },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (url.includes("/api/permissions")) {
      return new Response(
        JSON.stringify({
          items: [],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (url.includes("/api/departments")) {
      return new Response(
        JSON.stringify({
          items: [],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return originalFetch(input, init);
  };
}

test("Sidebar Navigation RBAC: non-admin user only sees authorized menu items", async () => {
  mockAuthAndApis({
    permissions: ["system:dept:read"],
  });

  const screen = await renderAppAt("/");

  // Departments menu item should be in the DOM
  const deptMenu = screen.getByRole("menuitem", {
    name: /Departments|部門管理/i,
  });
  await expect.element(deptMenu).toBeInTheDocument();

  // Roles and Users menu items should NOT exist in the DOM
  const roleMenu = screen.getByRole("menuitem", {
    name: /Roles|角色權限/i,
  });
  await expect.element(roleMenu).not.toBeInTheDocument();

  const userMenu = screen.getByRole("menuitem", {
    name: /Users|人員管理/i,
  });
  await expect.element(userMenu).not.toBeInTheDocument();
});

test("Sidebar Navigation RBAC: super_admin sees all administration menu items", async () => {
  mockAuthAndApis({
    roles: ["super_admin"],
  });

  const screen = await renderAppAt("/");

  const deptMenu = screen.getByRole("menuitem", {
    name: /Departments|部門管理/i,
  });
  await expect.element(deptMenu).toBeInTheDocument();

  const roleMenu = screen.getByRole("menuitem", {
    name: /Roles|角色權限/i,
  });
  await expect.element(roleMenu).toBeInTheDocument();

  const userMenu = screen.getByRole("menuitem", {
    name: /Users|人員管理/i,
  });
  await expect.element(userMenu).toBeInTheDocument();
});

test("Route Guard: accessing unauthorized route redirects to 403 Forbidden page", async () => {
  mockAuthAndApis({
    permissions: ["system:dept:read"], // lacks system:role:read
  });

  const screen = await renderAppAt("/roles");

  // Should redirect to 403 page
  const forbiddenTitle = screen.getByText(/403 Forbidden|403 禁止訪問/i);
  await expect.element(forbiddenTitle).toBeInTheDocument();

  const forbiddenDesc = screen.getByText(
    /You do not have permission to access this resource|您沒有足夠的權限訪問此資源/i,
  );
  await expect.element(forbiddenDesc).toBeInTheDocument();
  await expect.element(forbiddenDesc).toBeVisible();
});

test("PermissionGate: hides action buttons when user lacks specific write permission", async () => {
  mockAuthAndApis({
    permissions: ["system:role:read"], // has read, but lacks system:role:create
  });

  const screen = await renderAppAt("/roles");

  // Scoped within main content
  const main = screen.getByRole("main");
  const cardTitle = main.getByText(/Roles & Permissions|角色權限/i);
  await expect.element(cardTitle).toBeInTheDocument();

  // "Create Role" button should be completely hidden by PermissionGate
  const createBtn = screen.getByRole("button", {
    name: /Create Role|新增角色/i,
  });
  await expect.element(createBtn).not.toBeInTheDocument();
});

test("PermissionGate: shows action buttons when user possesses write permission", async () => {
  mockAuthAndApis({
    permissions: ["system:role:read", "system:role:create"],
  });

  const screen = await renderAppAt("/roles");

  const createBtn = screen.getByRole("button", {
    name: /Create Role|新增角色/i,
  });
  await expect.element(createBtn).toBeInTheDocument();
  await expect.element(createBtn).toBeVisible();
});
