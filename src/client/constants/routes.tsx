import { ApartmentOutlined, SafetyCertificateOutlined, TeamOutlined } from "@ant-design/icons";
import { QueryClient } from "@tanstack/react-query";
import { createRouter, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { APP_TITLE } from "../config.ts";
import { useI18n } from "../hooks/useI18n.ts";
import { routeTree } from "../routeTree.gen.ts";
import type { RouterInputs } from "../types/api.ts";

export type { RouterInputs };

export interface MenuItemConfig {
  label: string;
  key: string;
  icon?: ReactNode;
  permission?: string;
}

/**
 * Items without an icon will not appear in the sidebar menu
 */
export const MENU_ITEMS: MenuItemConfig[] = [
  {
    label: "Login",
    key: "/login",
  },
  {
    label: "Departments",
    key: "/departments",
    icon: <ApartmentOutlined />,
    permission: "system:dept:read",
  },
  {
    label: "Roles",
    key: "/roles",
    icon: <SafetyCertificateOutlined />,
    permission: "system:role:read",
  },
  {
    label: "Users",
    key: "/user",
    icon: <TeamOutlined />,
    permission: "system:user:read",
  },
];

const defaultQueryClient = new QueryClient();

export const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL,
  context: {
    queryClient: defaultQueryClient,
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

  if (currentItem === undefined) {
    return APP_TITLE;
  }

  const translated = t(`routes.${currentItem.key}`);
  const label = translated !== `routes.${currentItem.key}` ? translated : currentItem.label;

  return `${label} - ${APP_TITLE}`;
};
