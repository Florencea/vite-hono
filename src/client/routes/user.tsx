import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, Flex } from "antd";
import { PermissionButton } from "../components/PermissionGate.tsx";
import { UserModal } from "../components/user/UserModal.tsx";
import { UserTable } from "../components/user/UserTable.tsx";
import { useI18n } from "../hooks/useI18n.ts";
import { useUsers } from "../hooks/useUsers.ts";
import { userInfoQueryOptions } from "./__root.tsx";

export const Route = createFileRoute("/user")({
  beforeLoad: async ({ context }) => {
    const data = await context.queryClient.query({
      ...userInfoQueryOptions(),
      staleTime: "static",
    });
    const isSuperAdmin = data.roles.includes("super_admin");
    const hasPerm =
      isSuperAdmin || data.permissions.includes("system:user:read");
    if (!hasPerm) {
      throw redirect({ to: "/403" });
    }
  },
  component: UsersPage,
});

function UsersPage() {
  const { t } = useI18n();
  const {
    users,
    departments,
    roles,
    isLoading,
    modalOpen,
    selectedUser,
    formKey,
    userForm,
    isSaving,
    openCreateModal,
    openEditModal,
    closeModal,
    submitForm,
    deleteUser,
  } = useUsers();

  return (
    <Card
      title={t("routes./user")}
      extra={
        <Flex gap="small">
          <PermissionButton
            type="primary"
            permission="system:user:create"
            onClick={openCreateModal}
          >
            {t("user.create")}
          </PermissionButton>
        </Flex>
      }
    >
      <UserTable
        data={users}
        departments={departments}
        roles={roles}
        loading={isLoading}
        onEdit={openEditModal}
        onDelete={deleteUser}
      />
      <UserModal
        open={modalOpen}
        user={selectedUser}
        departments={departments}
        roles={roles}
        formKey={formKey}
        userForm={userForm}
        confirmLoading={isSaving}
        onCancel={closeModal}
        onOk={() => {
          void submitForm();
        }}
      />
    </Card>
  );
}
