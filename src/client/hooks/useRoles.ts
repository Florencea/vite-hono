import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useState } from "react";
import { api } from "../api.ts";
import type {
  DepartmentItem,
  PermissionItem,
  RoleItem,
  RouterInputs,
} from "../types/api.ts";
import { useAntdForm } from "./useAntdForm.ts";
import { useI18n } from "./useI18n.ts";

export type RoleFormValues = Pick<
  RouterInputs["role"]["create"],
  "code" | "name" | "sort" | "dataScope"
> & {
  description?: string | null;
  permissionIds: number[];
  departmentIds?: number[];
};

/**
 * Headless Feature Hook encapsulating all Role state, queries, RPC mutations, and forms.
 */
export function useRoles() {
  const { message } = App.useApp();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles", "list"],
    queryFn: async () => {
      const res = await api.roles.$get();
      if (!(res as Response).ok) {
        throw new Error("Failed to fetch roles");
      }
      return (await res.json()) as { items: RoleItem[] };
    },
  });

  const { data: permsData } = useQuery({
    queryKey: ["permissions", "list"],
    queryFn: async () => {
      const res = await api.permissions.$get();
      if (!(res as Response).ok) {
        throw new Error("Failed to fetch permissions");
      }
      return (await res.json()) as { items: PermissionItem[] };
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.roles[":id"].$delete({
        param: { id: id.toString() },
      });
      if (!(res as Response).ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to delete role");
      }
      return res.json();
    },
    onSuccess: () => {
      void message.success(t("common.success"));
      void queryClient.invalidateQueries({ queryKey: ["roles", "list"] });
    },
    onError: (err) => {
      void message.error(err.message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: RoleFormValues) => {
      if (selectedRole) {
        const res = await api.roles[":id"].$put({
          param: { id: selectedRole.id.toString() },
          json: {
            name: values.name,
            description: values.description ?? null,
            dataScope: values.dataScope,
            sort: values.sort,
            permissionIds: values.permissionIds,
            departmentIds:
              values.dataScope === "CUSTOM" ? (values.departmentIds ?? []) : [],
          },
        });
        if (!(res as Response).ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Failed to update role");
        }
        return res.json();
      }

      const res = await api.roles.$post({
        json: {
          code: values.code,
          name: values.name,
          description: values.description ?? undefined,
          dataScope: values.dataScope,
          sort: values.sort,
          permissionIds: values.permissionIds,
          departmentIds:
            values.dataScope === "CUSTOM" ? (values.departmentIds ?? []) : [],
        },
      });
      if (!(res as Response).ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to create role");
      }
      return res.json();
    },
    onSuccess: () => {
      void message.success(t("common.success"));
      closeDrawer();
      void queryClient.invalidateQueries({ queryKey: ["roles", "list"] });
    },
    onError: (err) => {
      void message.error(err.message);
    },
  });

  const [formRevision, setFormRevision] = useState(0);

  const initialValues: RoleFormValues = {
    code: selectedRole?.code ?? "",
    name: selectedRole?.name ?? "",
    description: selectedRole?.description ?? "",
    dataScope: selectedRole?.dataScope ?? "SELF",
    sort: selectedRole?.sort ?? 1,
    departmentIds: selectedRole?.departmentIds ?? [],
    permissionIds: selectedRole?.permissionIds ?? [],
  };

  const formKey = `${selectedRole ? selectedRole.id.toString() : "new"}-${formRevision.toString()}`;

  const roleForm = useAntdForm<RoleFormValues>({
    formProps: {
      layout: "vertical",
      initialValues,
      onFinish: (values) => {
        saveMutation.mutate(values);
      },
    },
    formItemProps: {
      code: {
        name: "code",
        label: t("role.code"),
        rules: [{ required: true }],
      },
      name: {
        name: "name",
        label: t("role.name"),
        rules: [{ required: true }],
      },
      description: {
        name: "description",
        label: t("role.description"),
      },
      sort: {
        name: "sort",
        label: t("dept.sort"),
      },
      dataScope: {
        name: "dataScope",
        label: t("role.dataScope"),
        rules: [{ required: true }],
      },
      departmentIds: {
        name: "departmentIds",
        label: t("role.customDepts"),
        rules: [{ required: true }],
      },
      permissionIds: {
        name: "permissionIds",
        label: t("role.permissions"),
      },
    },
  });

  const openCreateDrawer = () => {
    setSelectedRole(null);
    setFormRevision((r) => r + 1);
    setDrawerOpen(true);
  };

  const openEditDrawer = (role: RoleItem) => {
    setSelectedRole(role);
    setFormRevision((r) => r + 1);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const submitForm = async () => {
    const values = await roleForm.formInstance.validateFields();
    saveMutation.mutate(values);
  };

  return {
    roles: rolesData?.items ?? [],
    permissions: permsData?.items ?? [],
    departments: deptsData?.items ?? [],
    isLoading: rolesLoading,
    drawerOpen,
    selectedRole,
    formKey,
    roleForm,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    openCreateDrawer,
    openEditDrawer,
    closeDrawer,
    submitForm,
    deleteRole: (id: number) => {
      deleteMutation.mutate(id);
    },
  };
}
