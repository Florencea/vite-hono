import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { Layout as AntdLayout, Button, Menu, Typography, theme } from "antd";
import clsx from "clsx";
import { useState } from "react";
import logo from "../assets/logo.png";
import { useAuth } from "../libs/useAuth";
import { useI18n } from "../libs/useI18n";
import { useUserInfo } from "../libs/useUserInfo";
import { DocTitle } from "./DocTitle";
import { I18nSwitcher } from "./i18n-switcher";

const { Header, Sider, Content } = AntdLayout;
const { Text } = Typography;

export const Layout = () => {
  const { t } = useI18n();
  const { token } = theme.useToken();
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
            style={{ background: token.colorBgContainer }}
            className={clsx("flex items-center justify-between px-3", {
              "lg:px-4": !collapsed,
            })}
          >
            <Link className="flex items-center gap-3" to="/">
              <img className="h-6 w-6 shrink-0" src={logo} alt="logo" />
              <Text
                strong
                className="shrink-0 text-sm tracking-wide sm:text-base"
              >
                {import.meta.env.VITE_TITLE}
              </Text>
            </Link>
            <div className="flex items-center">
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
            </div>
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
