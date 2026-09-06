import { TeamOutlined } from "@ant-design/icons";
import { createRouter, useRouterState } from "@tanstack/react-router";
import type { MenuProps } from "antd";
import type { InferRequestType, InferResponseType } from "hono/client";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import { routeTree } from "../routeTree.gen";

export const LOGIN_ROUTE = "/login";

export type LoginInput = InferRequestType<typeof api.auth.login.$post>["json"];
export type LoginOutput = InferResponseType<typeof api.auth.login.$post>;
export type UserInfoOutput = InferResponseType<typeof api.auth.getUserInfo.$get>;

export type RouterInputs = {
  auth: {
    login: LoginInput;
  };
};

export type RouterOutputs = {
  auth: {
    login: LoginOutput;
    getUserInfo: UserInfoOutput;
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
    queryClient: undefined!,
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

  const currentLabel = MENU_ITEMS.find((item) => item?.key?.toString() === pathname);

  return currentLabel
    ? `${t(currentLabel.key, { defaultValue: currentLabel.label })} - ${import.meta.env.VITE_TITLE}`
    : import.meta.env.VITE_TITLE;
};
