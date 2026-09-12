import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useState } from "react";
import { api } from "../api.ts";
import type {
  DepartmentItem,
  RoleItem,
  RouterInputs,
  UserItem,
} from "../types/api.ts";
import { useAntdForm } from "./useAntdForm.ts";
import { useI18n } from "./useI18n.ts";

export type UserFormValues = Pick<
  RouterInputs["user"]["create"],
  "account" | "status" | "roleIds"
> & {
  password?: string;
  name?: string | null;
  employeeNo?: string | null;
  title?: string | null;
  departmentId?: number | null;
};

/**
 * Headless Feature Hook encapsulating all User state, queries, RPC mutations, and forms.
 */
export function useUsers() {
  const { message } = App.useApp();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", "list"],
    queryFn: async () => {
      const res = await api.users.$get();
      if (!(res as Response).ok) {
        throw new Error("Failed to fetch users");
      }
      return (await res.json()) as { items: UserItem[] };
    },
  });

  const { data: deptsData } = useQuery({
    queryKey: ["departments", "list"],
    queryFn: async () => {
      const res = await api.departments.$get();
      if (!(res as Response).ok) {
        throw new Error("Failed to fetch departments");
      }
      return (await res.json()) as { items: DepartmentItem[] };
    },
  });

  const { data: rolesData } = useQuery({
    queryKey: ["roles", "list"],
    queryFn: async () => {
      const res = await api.roles.$get();
      if (!(res as Response).ok) {
        throw new Error("Failed to fetch roles");
      }
      return (await res.json()) as { items: RoleItem[] };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.users[":id"].$delete({
        param: { id: id.toString() },
      });
      if (!(res as Response).ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to delete user");
      }
      return res.json();
    },
    onSuccess: () => {
      void message.success(t("common.success"));
      void queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
    onError: (err) => {
      void message.error(err.message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const targetDeptId =
        values.departmentId !== undefined &&
        values.departmentId !== null &&
        values.departmentId > 0
          ? values.departmentId
          : null;

      if (selectedUser) {
        const res = await api.users[":id"].$put({
          param: { id: selectedUser.id.toString() },
          json: {
            password:
              values.password !== undefined && values.password.length > 0
                ? values.password
                : undefined,
            name: values.name ?? null,
            employeeNo: values.employeeNo ?? null,
            title: values.title ?? null,
            status: values.status,
            departmentId: targetDeptId,
            roleIds: values.roleIds,
          },
        });
        if (!(res as Response).ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Failed to update user");
        }
        return res.json();
      }

      const res = await api.users.$post({
        json: {
          account: values.account,
          password: values.password ?? "password123",
          name: values.name ?? undefined,
          employeeNo: values.employeeNo ?? undefined,
          title: values.title ?? undefined,
          status: values.status,
          departmentId: targetDeptId,
          roleIds: values.roleIds,
        },
      });
      if (!(res as Response).ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to create user");
      }
      return res.json();
    },
    onSuccess: () => {
      void message.success(t("common.success"));
      setModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
    onError: (err) => {
      void message.error(err.message);
    },
  });

  const isEdit = Boolean(selectedUser);

  const initialValues: UserFormValues = {
    account: selectedUser?.account ?? "",
    password: "",
    name: selectedUser?.name ?? "",
    employeeNo: selectedUser?.employeeNo ?? "",
    title: selectedUser?.title ?? "",
    status: selectedUser?.status ?? "active",
    departmentId: selectedUser?.departmentId ?? 0,
    roleIds: selectedUser?.roleIds ?? [],
  };

  const formKey = selectedUser ? selectedUser.id.toString() : "new";

  const userForm = useAntdForm<UserFormValues>({
    formProps: {
      layout: "vertical",
      initialValues,
      onFinish: (values) => {
        saveMutation.mutate(values);
      },
    },
    formItemProps: {
      account: {
        name: "account",
        label: t("user.account"),
        rules: [{ required: true }],
      },
      password: {
        name: "password",
        label: t("user.password"),
        rules: [{ required: !isEdit, min: 6 }],
      },
      name: {
        name: "name",
        label: t("user.name"),
      },
      employeeNo: {
        name: "employeeNo",
        label: t("user.employeeNo"),
      },
      title: {
        name: "title",
        label: t("user.title"),
      },
      departmentId: {
        name: "departmentId",
        label: t("user.department"),
      },
      roleIds: {
        name: "roleIds",
        label: t("user.roles"),
      },
      status: {
        name: "status",
        label: t("common.status"),
      },
    },
  });

  const openCreateModal = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const openEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const submitForm = async () => {
    const values = await userForm.formInstance.validateFields();
    saveMutation.mutate(values);
  };

  return {
    users: usersData?.items ?? [],
    departments: deptsData?.items ?? [],
    roles: rolesData?.items ?? [],
    isLoading: usersLoading,
    modalOpen,
    selectedUser,
    formKey,
    userForm,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    openCreateModal,
    openEditModal,
    closeModal,
    submitForm,
    deleteUser: (id: number) => {
      deleteMutation.mutate(id);
    },
  };
}
