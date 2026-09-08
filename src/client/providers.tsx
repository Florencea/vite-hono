import "dayjs/locale/zh-tw";
import "./global.css";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { App, ConfigProvider, message } from "antd";
import type { Locale } from "antd/es/locale";
import enUS from "antd/es/locale/en_US";
import zhTW from "antd/es/locale/zh_TW";
import { StrictMode, useEffect, useMemo, useState } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../i18n";
import { router } from "./constants/routes";
import { theme } from "./theme";

interface Props {
  children?: React.ReactNode;
}

interface ProviderProps extends Props {
  container: HTMLElement;
}

const antdLocales: Record<string, Locale> = {
  "en-US": enUS,
  "zh-TW": zhTW,
};

const AppRouterProvider = () => {
  const queryClient = useQueryClient();
  return <RouterProvider router={router} context={{ queryClient }} />;
};

export const Providers = ({ container }: { container: HTMLElement }) => {
  useEffect(() => {
    i18n.on("languageChanged", (lng) => {
      document.documentElement.setAttribute("lang", lng);
    });
    window.document.documentElement.lang = i18n.language;
  }, []);

  return (
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <ApiProvider>
          <AntdProvider container={container}>
            <AppRouterProvider />
          </AntdProvider>
        </ApiProvider>
      </I18nextProvider>
    </StrictMode>
  );
};

const AntdProvider = ({ container, children }: ProviderProps) => {
  const { i18n } = useTranslation();
  const [primaryColor, setPrimaryColor] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue("--color-primary")
          .trim() || undefined
      );
    }
    return undefined;
  });

  useEffect(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary")
      .trim();
    if (color && color !== primaryColor) {
      requestAnimationFrame(() => {
        setPrimaryColor(color);
      });
    }
  }, [primaryColor]);

  const dynamicTheme = useMemo(
    () => ({
      ...theme,
      token: {
        ...theme.token,
        colorPrimary: primaryColor,
        colorInfo: primaryColor,
      },
    }),
    [primaryColor],
  );

  return (
    <ConfigProvider
      getPopupContainer={() => container}
      locale={antdLocales[i18n.language]}
      theme={dynamicTheme}
      button={{ autoInsertSpace: false }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
};

const ApiProvider = ({ children }: Props) => {
  const [msg, msgContext] = message.useMessage();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (err) => {
            if (err.message) {
              void msg.error(err.message, 4.5);
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (err) => {
            if (err.message) {
              void msg.error(err.message, 4.5);
            }
          },
        }),
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {msgContext}
      {children}
    </QueryClientProvider>
  );
};
