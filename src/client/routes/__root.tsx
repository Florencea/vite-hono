import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, redirect } from "@tanstack/react-router";
import { api } from "../api";
import { Layout } from "../components/Layout";

export const userInfoQueryOptions = () => ({
  queryKey: ["auth", "getUserInfo"],
  queryFn: async () => {
    const res = await api.auth.getUserInfo.$get();
    if (!(res as Response).ok) {
      throw new Error("Failed to fetch user info");
    }
    return res.json();
  },
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  beforeLoad: async ({ context, location, search }) => {
    const data = await context.queryClient.query({
      ...userInfoQueryOptions(),
      staleTime: "static",
    });
    const isSuccess = data.success;
    if (!isSuccess && location.pathname !== "/login") {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.pathname + location.searchStr,
        },
        replace: true,
      });
    }
    if (isSuccess && location.pathname === "/login") {
      const redirectPath = (search as Record<string, unknown>).redirect;
      throw redirect({
        to: typeof redirectPath === "string" ? redirectPath : "/",
        replace: true,
      });
    }
  },
  component: Layout,
});
