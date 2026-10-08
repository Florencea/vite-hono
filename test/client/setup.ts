import { afterEach } from "vite-plus/test";
import { cleanupApp } from "./test-utils";

afterEach(async () => {
  await cleanupApp();
});

const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url =
    typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  if (url.includes("/api/auth/getUserInfo")) {
    return new Response(JSON.stringify({ success: false, account: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return originalFetch(input, init);
};
