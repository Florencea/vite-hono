import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MENU_ITEMS } from "../constants/routes";
import { userInfoQueryOptions } from "../routes/__root";
import { useI18n } from "./useI18n";

export const useUserInfo = () => {
  const { t } = useI18n();
  const userInfo = useQuery(userInfoQueryOptions());

  const menuItems = useMemo(() => {
    return MENU_ITEMS.filter(({ icon }) => Boolean(icon)).map((item) => ({
      ...item,
      label: t(`routes.${item.key}` as const),
    }));
  }, [t]);

  return {
    isLogin: !!userInfo.data?.success,
    account: userInfo.data?.account ?? undefined,
    menuItems,
  };
};
