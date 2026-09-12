import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, Flex } from "antd";
import { DepartmentModal } from "../components/department/DepartmentModal.tsx";
import { DepartmentTreeTable } from "../components/department/DepartmentTreeTable.tsx";
import { PermissionButton } from "../components/PermissionGate.tsx";
import { useDepartments } from "../hooks/useDepartments.ts";
import { useI18n } from "../hooks/useI18n.ts";
import { userInfoQueryOptions } from "./__root.tsx";

export const Route = createFileRoute("/departments")({
  beforeLoad: async ({ context }) => {
    const data = await context.queryClient.query({
      ...userInfoQueryOptions(),
      staleTime: "static",
    });
    const isSuperAdmin = data.roles.includes("super_admin");
    const hasPerm =
      isSuperAdmin || data.permissions.includes("system:dept:read");
    if (!hasPerm) {
      throw redirect({ to: "/403" });
    }
  },
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const { t } = useI18n();
  const {
    departments,
    treeData,
    isLoading,
    modalOpen,
    selectedDept,
    formKey,
    deptForm,
    isSaving,
    openCreateModal,
    openAddChildModal,
    openEditModal,
    closeModal,
    submitForm,
    deleteDepartment,
  } = useDepartments();

  return (
    <Card
      title={t("routes./departments")}
      extra={
        <Flex gap="small">
          <PermissionButton
            type="primary"
            permission="system:dept:create"
            onClick={openCreateModal}
          >
            {t("dept.create")}
          </PermissionButton>
        </Flex>
      }
    >
      <DepartmentTreeTable
        data={treeData}
        loading={isLoading}
        onAddChild={openAddChildModal}
        onEdit={openEditModal}
        onDelete={deleteDepartment}
      />
      <DepartmentModal
        open={modalOpen}
        department={selectedDept}
        departments={departments}
        formKey={formKey}
        deptForm={deptForm}
        confirmLoading={isSaving}
        onCancel={closeModal}
        onOk={() => {
          void submitForm();
        }}
      />
    </Card>
  );
}
