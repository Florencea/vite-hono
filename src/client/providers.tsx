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
import { StrictMode, useEffect, useMemo, useState } from "react";
import { I18nProvider } from "./components/i18n-provider";
import { router } from "./constants/routes";
import { antdLocales, useI18n } from "./libs/useI18n";
import { theme } from "./theme";

interface Props {
  children?: React.ReactNode;
  queryClient?: QueryClient;
}

interface ProviderProps extends Props {
  container: HTMLElement;
}

const AppRouterProvider = () => {
  const queryClient = useQueryClient();
  return <RouterProvider router={router} context={{ queryClient }} />;
};

export const Providers = ({
  container,
  children,
  queryClient,
}: ProviderProps) => {
  return (
    <StrictMode>
      <I18nProvider>
        <ApiProvider queryClient={queryClient}>
          <AntdProvider container={container}>
            {children ?? <AppRouterProvider />}
          </AntdProvider>
        </ApiProvider>
      </I18nProvider>
    </StrictMode>
  );
};

const AntdProvider = ({ container, children }: ProviderProps) => {
  const { locale } = useI18n();
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
      locale={antdLocales[locale]}
      theme={dynamicTheme}
      button={{ autoInsertSpace: false }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
};

const ApiProvider = ({ children, queryClient: customQueryClient }: Props) => {
  const [msg, msgContext] = message.useMessage();

  const [defaultQueryClient] = useState(
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

  const queryClient = customQueryClient ?? defaultQueryClient;

  return (
    <QueryClientProvider client={queryClient}>
      {msgContext}
      {children}
    </QueryClientProvider>
  );
};
