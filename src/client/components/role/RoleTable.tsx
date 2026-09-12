import { Button, Popconfirm, Space, type TableProps, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useI18n } from "../../hooks/useI18n.ts";
import type { RoleItem } from "../../types/api.ts";
import { DataTable } from "../common/DataTable.tsx";
import { PermissionButton, PermissionGate } from "../PermissionGate.tsx";

export interface RoleTableProps extends Pick<TableProps<RoleItem>, "loading"> {
  data: RoleItem[];
  onEdit: (record: RoleItem) => void;
  onDelete: (id: number) => void;
}

const SCOPE_COLORS: Record<string, string> = {
  ALL: "purple",
  DEPT_AND_CHILD: "blue",
  DEPT: "cyan",
  SELF: "orange",
  CUSTOM: "geekblue",
};

export function RoleTable({ data, loading, onEdit, onDelete }: RoleTableProps) {
  const { t } = useI18n();

  const columns: ColumnsType<RoleItem> = [
    {
      title: t("role.code"),
      dataIndex: "code",
      key: "code",
      width: 150,
      render: (text: string, record) => (
        <Space>
          <span>{text}</span>
          {record.isSystem ? <Tag color="gold">System</Tag> : null}
        </Space>
      ),
    },
    {
      title: t("role.name"),
      dataIndex: "name",
      key: "name",
      width: 180,
    },
    {
      title: t("role.dataScope"),
      dataIndex: "dataScope",
      key: "dataScope",
      width: 180,
      render: (scope: RoleItem["dataScope"]) => (
        <Tag color={SCOPE_COLORS[scope] ?? "default"}>
          {t(`role.scopes.${scope}` as const)}
        </Tag>
      ),
    },
    {
      title: t("dept.sort"),
      dataIndex: "sort",
      key: "sort",
      width: 80,
    },
    {
      title: t("role.description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("common.actions"),
      key: "actions",
      width: 160,
      render: (_, record) => (
        <Space size="middle">
          <PermissionButton
            type="link"
            size="small"
            permission="system:role:update"
            onClick={() => {
              onEdit(record);
            }}
          >
            {t("common.edit")}
          </PermissionButton>
          {!record.isSystem && (
            <PermissionGate permission="system:role:delete">
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
    <DataTable<RoleItem>
      columns={columns}
      dataSource={data}
      loading={loading}
    />
  );
}
