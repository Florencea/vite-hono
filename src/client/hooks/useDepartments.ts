import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useState } from "react";
import { api } from "../api.ts";
import type { DepartmentNode } from "../components/department/DepartmentTreeTable.tsx";
import type { DepartmentItem, RouterInputs } from "../types/api.ts";
import { useAntdForm } from "./useAntdForm.ts";
import { useI18n } from "./useI18n.ts";

export type DepartmentFormValues = Pick<
  RouterInputs["department"]["create"],
  "name" | "sort"
> & {
  parentId: number;
};

function buildTree(items: DepartmentItem[]): DepartmentNode[] {
  const map = new Map<number, DepartmentNode>();
  const roots: DepartmentNode[] = [];

  for (const item of items) {
    map.set(item.id, { ...item, key: item.id.toString(), children: [] });
  }

  for (const item of items) {
    const node = map.get(item.id);
    if (!node) continue;
    if (item.parentId && map.has(item.parentId)) {
      const parent = map.get(item.parentId);
      if (parent) {
        parent.children ??= [];
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * Headless Feature Hook encapsulating all Department state, queries, RPC mutations, and forms.
 */
export function useDepartments() {
  const { message } = App.useApp();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentItem | null>(null);
  const [parentPresetId, setParentPresetId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["departments", "list"],
    queryFn: async () => {
      const res = await api.departments.$get();
      if (!(res as Response).ok) {
        throw new Error("Failed to fetch departments");
      }
      return (await res.json()) as { items: DepartmentItem[] };
    },
  });

  const departmentItems = data?.items ?? [];
  const treeData = buildTree(departmentItems);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.departments[":id"].$delete({
        param: { id: id.toString() },
      });
      if (!(res as Response).ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to delete department");
      }
      return res.json();
    },
    onSuccess: () => {
      void message.success(t("common.success"));
      void queryClient.invalidateQueries({ queryKey: ["departments", "list"] });
    },
    onError: (err) => {
      void message.error(err.message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: DepartmentFormValues) => {
      const targetParentId = values.parentId === 0 ? null : values.parentId;

      if (selectedDept) {
        const res = await api.departments[":id"].$put({
          param: { id: selectedDept.id.toString() },
          json: {
            name: values.name,
            parentId: targetParentId,
            sort: values.sort,
          },
        });
        if (!(res as Response).ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Failed to update department");
        }
        return res.json();
      }

      const res = await api.departments.$post({
        json: {
          name: values.name,
          parentId: targetParentId,
          sort: values.sort,
        },
      });
      if (!(res as Response).ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to create department");
      }
      return res.json();
    },
    onSuccess: () => {
      void message.success(t("common.success"));
      closeModal();
      void queryClient.invalidateQueries({ queryKey: ["departments", "list"] });
    },
    onError: (err) => {
      void message.error(err.message);
    },
  });

  const [formRevision, setFormRevision] = useState(0);

  const initialValues: DepartmentFormValues = {
    name: selectedDept?.name ?? "",
    parentId: selectedDept
      ? (selectedDept.parentId ?? 0)
      : (parentPresetId ?? 0),
    sort: selectedDept?.sort ?? 1,
  };

  const formKey = `${selectedDept ? selectedDept.id.toString() : `new-${(parentPresetId ?? 0).toString()}`}-${formRevision.toString()}`;

  const deptForm = useAntdForm<DepartmentFormValues>({
    formProps: {
      layout: "vertical",
      initialValues,
      onFinish: (values) => {
        saveMutation.mutate(values);
      },
    },
    formItemProps: {
      name: {
        name: "name",
        label: t("dept.name"),
        rules: [{ required: true }],
      },
      parentId: {
        name: "parentId",
        label: t("dept.parent"),
      },
      sort: {
        name: "sort",
        label: t("dept.sort"),
      },
    },
  });

  const openCreateModal = () => {
    setSelectedDept(null);
    setParentPresetId(null);
    setFormRevision((r) => r + 1);
    setModalOpen(true);
  };

  const openAddChildModal = (parent: DepartmentItem) => {
    setSelectedDept(null);
    setParentPresetId(parent.id);
    setFormRevision((r) => r + 1);
    setModalOpen(true);
  };

  const openEditModal = (dept: DepartmentItem) => {
    setSelectedDept(dept);
    setParentPresetId(null);
    setFormRevision((r) => r + 1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const submitForm = async () => {
    const values = await deptForm.formInstance.validateFields();
    saveMutation.mutate(values);
  };

  return {
    departments: departmentItems,
    treeData,
    isLoading,
    modalOpen,
    selectedDept,
    parentPresetId,
    formKey,
    deptForm,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    openCreateModal,
    openAddChildModal,
    openEditModal,
    closeModal,
    submitForm,
    deleteDepartment: (id: number) => {
      deleteMutation.mutate(id);
    },
  };
}
