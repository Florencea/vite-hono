import { GlobalOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, type MenuProps } from "antd";
import { isSupportedLocale } from "../../locales/registry.ts";
import { useI18n } from "../hooks/useI18n.ts";

export const I18nSwitcher = () => {
  const { t, locale, setLocale, supportedLocales } = useI18n();
  const queryClient = useQueryClient();

  const items: MenuProps["items"] = Object.entries(supportedLocales).map(([key, meta]) => ({
    label: meta.name,
    key,
  }));

  return (
    <Dropdown
      menu={{
        selectable: true,
        selectedKeys: [locale],
        items,
        onClick: ({ key }) => {
          if (isSupportedLocale(key)) {
            setLocale(key);
            void queryClient.invalidateQueries();
          }
        },
      }}
      trigger={["click"]}
      arrow
    >
      <Button
        type="text"
        className="flex items-center justify-center"
        title={t("common.changeLanguage")}
      >
        <GlobalOutlined />
      </Button>
    </Dropdown>
  );
};
