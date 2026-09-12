import {
  Button,
  Drawer,
  type DrawerProps,
  Flex,
  Form,
  Input,
  InputNumber,
  Radio,
  Space,
  Tree,
  TreeSelect,
} from "antd";
import type { DataNode } from "antd/es/tree";
import { useI18n } from "../../hooks/useI18n.ts";
import type { useRoles } from "../../hooks/useRoles.ts";
import type {
  DepartmentItem,
  PermissionItem,
  RoleItem,
} from "../../types/api.ts";

export interface RoleDrawerProps extends Pick<DrawerProps, "open"> {
  role: RoleItem | null;
  permissions: PermissionItem[];
  departments: DepartmentItem[];
  formKey: string;
  roleForm: ReturnType<typeof useRoles>["roleForm"];
  confirmLoading: boolean;
  onClose: () => void;
  onSave: () => void;
}

function PermissionTreeInput({
  value = [],
  onChange,
  treeData,
}: {
  value?: number[];
  onChange?: (checked: number[]) => void;
  treeData: DataNode[];
}) {
  return (
    <Tree
      checkable
      checkedKeys={value}
      onCheck={(keys) => {
        onChange?.(
          Array.isArray(keys) ? (keys as number[]) : (keys.checked as number[]),
        );
      }}
      treeData={treeData}
    />
  );
}

export function RoleDrawer({
  open,
  role,
  permissions,
  departments,
  formKey,
  roleForm,
  confirmLoading,
  onClose,
  onSave,
}: RoleDrawerProps) {
  const { t } = useI18n();
  const isEdit = Boolean(role);

  const selectedScope =
    (Form.useWatch("dataScope", roleForm.formInstance) as
      RoleItem["dataScope"] | undefined) ??
    role?.dataScope ??
    "SELF";

  const permissionTreeData: DataNode[] = permissions.map((p) => ({
    key: p.id,
    title: `${p.name} (${p.code})`,
  }));

  const deptTreeData = departments.map((d) => ({
    title: d.name,
    value: d.id,
    key: d.id.toString(),
  }));

  return (
    <Drawer
      open={open}
      title={isEdit ? t("role.edit") : t("role.create")}
      onClose={onClose}
      size="large"
      destroyOnHidden
      extra={
        <Space>
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="primary" loading={confirmLoading} onClick={onSave}>
            {t("common.save")}
          </Button>
        </Space>
      }
    >
      <Form key={formKey} {...roleForm.formProps}>
        <Form.Item {...roleForm.formItemProps.code}>
          <Input disabled={isEdit} />
        </Form.Item>
        <Form.Item {...roleForm.formItemProps.name}>
          <Input />
        </Form.Item>
        <Form.Item {...roleForm.formItemProps.description}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item {...roleForm.formItemProps.sort}>
          <InputNumber min={0} className="w-full" />
        </Form.Item>
        <Form.Item {...roleForm.formItemProps.dataScope}>
          <Radio.Group>
            <Flex vertical gap="small">
              <Radio value="ALL">{t("role.scopes.ALL")}</Radio>
              <Radio value="DEPT_AND_CHILD">
                {t("role.scopes.DEPT_AND_CHILD")}
              </Radio>
              <Radio value="DEPT">{t("role.scopes.DEPT")}</Radio>
              <Radio value="SELF">{t("role.scopes.SELF")}</Radio>
              <Radio value="CUSTOM">{t("role.scopes.CUSTOM")}</Radio>
            </Flex>
          </Radio.Group>
        </Form.Item>

        {selectedScope === "CUSTOM" && (
          <Form.Item {...roleForm.formItemProps.departmentIds}>
            <TreeSelect
              treeData={deptTreeData}
              treeCheckable
              showCheckedStrategy={TreeSelect.SHOW_ALL}
              placeholder={t("role.customDepts")}
            />
          </Form.Item>
        )}

        <Form.Item {...roleForm.formItemProps.permissionIds}>
          <PermissionTreeInput treeData={permissionTreeData} />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
