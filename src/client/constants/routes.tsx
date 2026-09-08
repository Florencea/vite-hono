import { TeamOutlined } from "@ant-design/icons";
import type { QueryClient } from "@tanstack/react-query";
import { createRouter, useRouterState } from "@tanstack/react-router";
import type { MenuProps } from "antd";
import type { InferRequestType } from "hono/client";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import { routeTree } from "../routeTree.gen";

type LoginInput = InferRequestType<typeof api.auth.login.$post>["json"];

export type RouterInputs = {
  auth: {
    login: LoginInput;
  };
};

type MenuItemsT = Required<MenuProps>["items"];

/**
 * Items without an icon will not appear in the sidebar menu
 */
export const MENU_ITEMS = [
  {
    label: "Login",
    key: "/login",
    icon: null,
    children: [],
  },
  {
    label: "Users",
    key: "/user",
    icon: <TeamOutlined />,
  },
] satisfies MenuItemsT;

export const router = createRouter({
  routeTree: routeTree,
  basepath: import.meta.env.BASE_URL,
  context: {
    queryClient: undefined as unknown as QueryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const useSiteTitle = () => {
  const { t } = useTranslation("routes");
  const {
    location: { pathname },
  } = useRouterState();

  const currentLabel = MENU_ITEMS.find((item) => item.key === pathname);

  return currentLabel
    ? `${t(currentLabel.key, { defaultValue: currentLabel.label })} - ${import.meta.env.VITE_TITLE}`
    : import.meta.env.VITE_TITLE;
};
