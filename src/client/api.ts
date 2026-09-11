import { hc } from "hono/client";
import type { AppType } from "../server/router";

const endpoint: string =
  typeof import.meta.env.VITE_API_ENDPOINT_RPC === "string"
    ? import.meta.env.VITE_API_ENDPOINT_RPC
    : "/api";

function getCurrentLanguage(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("app_lang");
    if (stored) return stored;
    const docLang = document.documentElement.lang;
    return docLang !== "" ? docLang : "en-US";
  }
  return "en-US";
}

export const api = hc<AppType>(endpoint, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    headers.set("Accept-Language", getCurrentLanguage());
    return fetch(input, {
      ...init,
      headers,
    });
  },
});

export type { AppType };
