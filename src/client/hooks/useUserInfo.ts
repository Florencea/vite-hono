import { useQuery } from "@tanstack/react-query";
import { MENU_ITEMS } from "../constants/routes";
import { userInfoQueryOptions } from "../routes/__root";
import { useI18n } from "./useI18n";

export const useUserInfo = () => {
  const { t } = useI18n();
  const userInfo = useQuery(userInfoQueryOptions());

  const menuItems = MENU_ITEMS.filter((item) => item.icon).map((item) => ({
    ...item,
    label: t(`routes.${item.key}` as const),
  }));

  return {
    isLogin: Boolean(userInfo.data?.success),
    account: userInfo.data?.account ?? undefined,
    menuItems,
  };
};
