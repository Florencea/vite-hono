import { expect, test, vi } from "vitest";
import { renderAppAt } from "./test-utils";

test("SSOT Token Bridge: Tailwind --color-primary bridges into Antd primary button background", async () => {
  const screen = await renderAppAt("/login");

  const submitBtn = screen.getByRole("button", { name: /submit|送出/i });
  await expect.element(submitBtn).toBeVisible();

  // Validate the computed background color matches Tailwind primary token (#2f54eb -> rgb(47, 84, 235))
  const btnBg = window.getComputedStyle(submitBtn.element()).backgroundColor;
  expect(btnBg).toBe("rgb(47, 84, 235)");
});

test("E2E Form Contract: Required validation blocks empty submission without network call", async () => {
  const fetchSpy = vi.spyOn(window, "fetch");
  const screen = await renderAppAt("/login");

  const submitBtn = screen.getByRole("button", { name: /submit|送出/i });
  await expect.element(submitBtn).toBeVisible();

  // Click submit on empty form
  await submitBtn.click();

  // Antd validation should display required error message with auto-waiting
  const errorMsg = screen.getByText(/Please enter Account|請輸入帳號/i);
  await expect.element(errorMsg).toBeVisible();

  // No login network request should be dispatched by Hono RPC client
  const loginCalls = fetchSpy.mock.calls.filter(([callInput]) => {
    const url =
      typeof callInput === "string"
        ? callInput
        : callInput instanceof URL
          ? callInput.toString()
          : callInput.url;
    return url.includes("/api/auth/login");
  });
  expect(loginCalls).toHaveLength(0);
  fetchSpy.mockRestore();
});

test("E2E RPC Wire Contract: Form submission dispatches typed payload matching LoginReqSchema", async () => {
  let dispatchedPayload: unknown = null;
  let dispatchedUrl: string | undefined = undefined;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    if (urlStr.includes("/api/auth/login")) {
      dispatchedUrl = urlStr;
      if (init?.body && typeof init.body === "string") {
        try {
          dispatchedPayload = JSON.parse(init.body);
        } catch {
          dispatchedPayload = init.body;
        }
      }
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return originalFetch(input, init);
  };

  const screen = await renderAppAt("/login");

  const accountInput = screen.getByRole("textbox", { name: /account|帳號/i });
  const passwordInput = screen.getByLabelText(/password|密碼/i);
  const submitBtn = screen.getByRole("button", { name: /submit|送出/i });

  await accountInput.fill("admin");
  await passwordInput.fill("password123");

  await submitBtn.click();

  // Verify Hono RPC endpoint and wire payload format
  expect(dispatchedUrl).toContain("/api/auth/login");
  expect(dispatchedPayload).toEqual({
    account: "admin",
    password: "password123",
  });

  // Verify the error toast/message is rendered via Antd App context
  const toast = screen.getByText("Invalid credentials");
  await expect.element(toast).toBeInTheDocument();
  await expect.element(toast).toBeVisible();

  window.fetch = originalFetch;
});
