import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, Flex } from "antd";
import { PermissionButton } from "../components/PermissionGate.tsx";
import { RoleDrawer } from "../components/role/RoleDrawer.tsx";
import { RoleTable } from "../components/role/RoleTable.tsx";
import { useI18n } from "../hooks/useI18n.ts";
import { useRoles } from "../hooks/useRoles.ts";
import { userInfoQueryOptions } from "./__root.tsx";

export const Route = createFileRoute("/roles")({
  beforeLoad: async ({ context }) => {
    const data = await context.queryClient.query({
      ...userInfoQueryOptions(),
      staleTime: "static",
    });
    const isSuperAdmin = data.roles.includes("super_admin");
    const hasPerm =
      isSuperAdmin || data.permissions.includes("system:role:read");
    if (!hasPerm) {
      throw redirect({ to: "/403" });
    }
  },
  component: RolesPage,
});

function RolesPage() {
  const { t } = useI18n();
  const {
    roles,
    permissions,
    departments,
    isLoading,
    drawerOpen,
    selectedRole,
    formKey,
    roleForm,
    isSaving,
    openCreateDrawer,
    openEditDrawer,
    closeDrawer,
    submitForm,
    deleteRole,
  } = useRoles();

  return (
    <Card
      title={t("routes./roles")}
      extra={
        <Flex gap="small">
          <PermissionButton
            type="primary"
            permission="system:role:create"
            onClick={openCreateDrawer}
          >
            {t("role.create")}
          </PermissionButton>
        </Flex>
      }
    >
      <RoleTable
        data={roles}
        loading={isLoading}
        onEdit={openEditDrawer}
        onDelete={deleteRole}
      />

      <RoleDrawer
        open={drawerOpen}
        role={selectedRole}
        permissions={permissions}
        departments={departments}
        formKey={formKey}
        roleForm={roleForm}
        confirmLoading={isSaving}
        onClose={closeDrawer}
        onSave={() => {
          void submitForm();
        }}
      />
    </Card>
  );
}
