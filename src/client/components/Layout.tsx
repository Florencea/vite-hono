import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { Layout as AntdLayout, Button, Flex, Menu, Typography } from "antd";
import clsx from "clsx";
import { useState } from "react";
import logo from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth.ts";
import { useI18n } from "../hooks/useI18n.ts";
import { useUserInfo } from "../hooks/useUserInfo.ts";
import { DocTitle } from "./DocTitle.tsx";
import { I18nSwitcher } from "./I18nSwitcher.tsx";

const { Header, Sider, Content } = AntdLayout;
const { Text } = Typography;

export const Layout = () => {
  const { t } = useI18n();
  const routerState = useRouterState();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const { isLogin, account, menuItems } = useUserInfo();

  return (
    <>
      <DocTitle />
      <AntdLayout className="h-svh max-w-svw">
        {isLogin && (
          <Header
            className={clsx(
              "flex items-center justify-between bg-white px-3 dark:bg-(--ant-color-bg-container)",
              {
                "lg:px-4": !collapsed,
              },
            )}
          >
            <Link className="inline-flex items-center gap-3" to="/">
              <img className="h-6 w-6 shrink-0" src={logo} alt="logo" />
              <Text
                strong
                className="shrink-0 text-sm tracking-wide sm:text-base"
              >
                {import.meta.env.VITE_TITLE}
              </Text>
            </Link>
            <Flex align="center">
              <Text strong className="mr-3">
                {account}
              </Text>
              <I18nSwitcher />
              <Button
                type="text"
                onClick={() => {
                  logout.mutate();
                }}
              >
                {t("common.logout")}
              </Button>
            </Flex>
          </Header>
        )}
        <AntdLayout hasSider={isLogin}>
          {isLogin && (
            <Sider
              theme="light"
              breakpoint="lg"
              collapsedWidth="48"
              collapsible
              collapsed={collapsed}
              onCollapse={(value) => {
                setCollapsed(value);
              }}
            >
              <Menu
                selectedKeys={[routerState.location.pathname]}
                onClick={({ key }) => {
                  void navigate({ to: key });
                }}
                items={menuItems}
              />
            </Sider>
          )}
          <AntdLayout>
            <Content className="p-3">
              <Outlet />
            </Content>
          </AntdLayout>
        </AntdLayout>
      </AntdLayout>
    </>
  );
};
