import "vitest-browser-react";
import { configure } from "vitest-browser-react/pure";

configure({
  reactStrictMode: true,
});

const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  if (url.includes("/api/auth/getUserInfo")) {
    return new Response(JSON.stringify({ success: false, account: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return originalFetch(input, init);
};
