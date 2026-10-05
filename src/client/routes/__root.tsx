import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { api } from "../api";
import { Layout } from "../components/Layout";

const RootSearchSchema = z.object({
  redirect: z.string().optional(),
});

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
      const parsedSearch = RootSearchSchema.safeParse(search);
      const redirectPath = parsedSearch.success ? parsedSearch.data.redirect : undefined;
      throw redirect({
        to: redirectPath !== undefined && redirectPath !== "" ? redirectPath : "/",
        replace: true,
      });
    }
  },
  component: Layout,
});
