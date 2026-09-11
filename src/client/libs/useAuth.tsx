import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import type { RouterInputs } from "../constants/routes";
import { useAntdForm } from "./useAntdForm";
import { useI18n } from "./useI18n";

export const useAuth = () => {
  const { t } = useI18n();

  const login = useMutation({
    mutationFn: async (input: RouterInputs["auth"]["login"]) => {
      const res = await api.auth.login.$post({ json: input });
      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorData.error ?? "Login failed");
      }
      return res.json();
    },
    onSuccess: () => {
      window.location.reload();
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      const res = await api.auth.logout.$post({});
      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorData.error ?? "Logout failed");
      }
      return res.json();
    },
    onSuccess: () => {
      window.location.reload();
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
