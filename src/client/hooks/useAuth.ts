import { useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { ErrorResSchema } from "../../server/common/schemas.ts";
import { api } from "../api";
import type { RouterInputs } from "../constants/routes";
import { useAntdForm } from "./useAntdForm";
import { useI18n } from "./useI18n";

export const useAuth = () => {
  const { message } = App.useApp();
  const { t } = useI18n();

  const login = useMutation({
    mutationFn: async (input: RouterInputs["auth"]["login"]) => {
      const res = await api.auth.login.$post({ json: input });
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const parsed = ErrorResSchema.safeParse(body);
        throw new Error(parsed.success ? parsed.data.error : "Login failed");
      }
      return await res.json();
    },
    onSuccess: () => {
      window.location.reload();
    },
    onError: (err) => {
      void message.error(err.message);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      const res = await api.auth.logout.$post({});
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const parsed = ErrorResSchema.safeParse(body);
        throw new Error(parsed.success ? parsed.data.error : "Logout failed");
      }
      return await res.json();
    },
    onSuccess: () => {
      window.location.reload();
    },
    onError: (err) => {
      void message.error(err.message);
    },
  });

  const loginForm = useAntdForm<RouterInputs["auth"]["login"]>({
    formProps: {
      layout: "vertical",
      disabled: login.isPending,
      onFinish: (values) => {
        login.mutate(values);
      },
    },
    formItemProps: {
      account: {
        name: "account",
        label: t("auth.account"),
        rules: [{ required: true }],
      },
      password: {
        name: "password",
        label: t("auth.password"),
        rules: [{ required: true }],
      },
    },
  });

  return { loginForm, login, logout };
};
