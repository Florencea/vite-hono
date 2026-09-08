import { GlobalOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, type MenuProps } from "antd";
import { useTranslation } from "react-i18next";

export const I18nSwitcher = () => {
  const { t, i18n } = useTranslation("i18nswicher");
  const queryClient = useQueryClient();

  const items: MenuProps["items"] = [
    {
      label: "繁體中文",
      key: "zh-TW",
    },
    {
      label: "English",
      key: "en-US",
    },
  ];

  return (
    <Dropdown
      menu={{
        selectable: true,
        selectedKeys: [i18n.language],
        items,
        onClick: ({ key }) => {
          void i18n.changeLanguage(key);
          void queryClient.invalidateQueries();
        },
      }}
      trigger={["click"]}
      arrow
    >
      <Button
        type="text"
        className="flex items-center justify-center"
        title={t("changelocale")}
      >
        <GlobalOutlined />
      </Button>
    </Dropdown>
  );
};
