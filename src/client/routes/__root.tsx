import { createRootRouteWithContext, redirect } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { Layout } from "../components/Layout";
import { api } from "../api";

export const userInfoQueryOptions = () => ({
  queryKey: ["auth", "getUserInfo"],
  queryFn: async () => {
    const res = await api.auth.getUserInfo.$get();
    if (!res.ok) {
      throw new Error("Failed to fetch user info");
    }
    return res.json();
  },
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  beforeLoad: async ({ context, location, search }) => {
    const data = await context.queryClient.ensureQueryData(userInfoQueryOptions());
    const isSuccess = data?.success === true;
    if (!isSuccess && location.pathname !== "/login") {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
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
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: typeof redirectPath === "string" ? redirectPath : "/",
        replace: true,
      });
    }
  },
  component: Layout,
});
