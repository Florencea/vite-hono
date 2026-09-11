import { TeamOutlined } from "@ant-design/icons";
import type { QueryClient } from "@tanstack/react-query";
import { createRouter, useRouterState } from "@tanstack/react-router";
import type { MenuProps } from "antd";
import type { InferRequestType } from "hono/client";
import { api } from "../api";
import { useI18n } from "../libs/useI18n";
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
  const { t } = useI18n();
  const {
    location: { pathname },
  } = useRouterState();

  const currentItem = MENU_ITEMS.find((item) => item.key === pathname);

  if (!currentItem) {
    return import.meta.env.VITE_TITLE;
  }

  const translated = t(`routes.${currentItem.key}` as const);
  const label =
    translated !== `routes.${currentItem.key}` ? translated : currentItem.label;

  return `${label} - ${import.meta.env.VITE_TITLE}`;
};
