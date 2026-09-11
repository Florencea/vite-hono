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
import { StrictMode, useState, type ReactNode } from "react";
import { I18nProvider } from "./components/I18nProvider.tsx";
import { router } from "./constants/routes.tsx";
import { antdLocales, useI18n } from "./hooks/useI18n.ts";
import { useAntdTheme } from "./theme.ts";

interface Props {
  children?: ReactNode;
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
  const dynamicTheme = useAntdTheme();

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
