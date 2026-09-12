import { useQuery } from "@tanstack/react-query";
import { MENU_ITEMS } from "../constants/routes.tsx";
import { userInfoQueryOptions } from "../routes/__root.tsx";
import { useAccess } from "./useAccess.ts";
import { useI18n } from "./useI18n.ts";

export const useUserInfo = () => {
  const { t } = useI18n();
  const userInfo = useQuery(userInfoQueryOptions());
  const { hasPermission } = useAccess();

  const menuItems = MENU_ITEMS.filter((item) => {
    if (!item.icon) return false;
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    return true;
  }).map((item) => ({
    key: item.key,
    icon: item.icon,
    label: t(`routes.${item.key}` as const),
  }));

  return {
    isLogin: Boolean(userInfo.data?.success),
    account: userInfo.data?.account ?? undefined,
    menuItems,
  };
};
