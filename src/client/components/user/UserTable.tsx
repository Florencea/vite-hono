import { Button, Popconfirm, Space, type TableProps, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useI18n } from "../../hooks/useI18n.ts";
import type { DepartmentItem, RoleItem, UserItem } from "../../types/api.ts";
import { DataTable } from "../common/DataTable.tsx";
import { PermissionButton, PermissionGate } from "../PermissionGate.tsx";

export interface UserTableProps extends Pick<TableProps<UserItem>, "loading"> {
  data: UserItem[];
  departments: DepartmentItem[];
  roles: RoleItem[];
  onEdit: (record: UserItem) => void;
  onDelete: (id: number) => void;
}

const STATUS_COLORS: Record<string, string> = {
  active: "success",
  inactive: "default",
  suspended: "error",
};

export function UserTable({
  data,
  departments,
  roles,
  loading,
  onEdit,
  onDelete,
}: UserTableProps) {
  const { t } = useI18n();

  const deptMap = new Map(departments.map((d) => [d.id, d.name]));
  const roleMap = new Map(roles.map((r) => [r.id, r.name]));

  const columns: ColumnsType<UserItem> = [
    {
      title: t("user.account"),
      dataIndex: "account",
      key: "account",
      width: 160,
      render: (account: string, record) => (
        <Space>
          <span>{account}</span>
          {record.isSystem || record.account === "admin" ? (
            <Tag color="gold">System</Tag>
          ) : null}
        </Space>
      ),
    },
    {
      title: t("user.name"),
      dataIndex: "name",
      key: "name",
      width: 120,
    },
    {
      title: t("user.employeeNo"),
      dataIndex: "employeeNo",
      key: "employeeNo",
      width: 120,
    },
    {
      title: t("user.title"),
      dataIndex: "title",
      key: "title",
      width: 120,
    },
    {
      title: t("user.department"),
      dataIndex: "departmentId",
      key: "departmentId",
      width: 140,
      render: (deptId: number | null) =>
        deptId ? (deptMap.get(deptId) ?? "-") : "-",
    },
    {
      title: t("user.roles"),
      dataIndex: "roleIds",
      key: "roleIds",
      render: (roleIds: number[]) => (
        <Space size={[0, 4]} wrap>
          {roleIds.map((rid) => (
            <Tag color="blue" key={rid}>
              {roleMap.get(rid) ?? rid}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: UserItem["status"]) => (
        <Tag color={STATUS_COLORS[status]}>
          {status === "active"
            ? t("user.statusActive")
            : status === "inactive"
              ? t("user.statusInactive")
              : t("user.statusSuspended")}
        </Tag>
      ),
    },
    {
      title: t("common.actions"),
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <PermissionButton
            type="link"
            size="small"
            permission="system:user:update"
            onClick={() => {
              onEdit(record);
            }}
          >
            {t("common.edit")}
          </PermissionButton>
          {!record.isSystem && record.account !== "admin" && (
            <PermissionGate permission="system:user:delete">
              <Popconfirm
                title={t("common.confirmDelete")}
                onConfirm={() => {
                  onDelete(record.id);
                }}
              >
                <Button type="link" danger size="small">
                  {t("common.delete")}
                </Button>
              </Popconfirm>
            </PermissionGate>
          )}
        </Space>
      ),
    },
  ];

  return (
    <DataTable<UserItem>
      columns={columns}
      dataSource={data}
      loading={loading}
    />
  );
}
