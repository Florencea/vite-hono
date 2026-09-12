import { Form, Input, type ModalProps, Radio, Select, TreeSelect } from "antd";
import { useI18n } from "../../hooks/useI18n.ts";
import type { useUsers } from "../../hooks/useUsers.ts";
import type { DepartmentItem, RoleItem, UserItem } from "../../types/api.ts";
import { DataModal } from "../common/DataModal.tsx";

export interface UserModalProps extends Pick<ModalProps, "open"> {
  user: UserItem | null;
  departments: DepartmentItem[];
  roles: RoleItem[];
  formKey: string;
  userForm: ReturnType<typeof useUsers>["userForm"];
  confirmLoading: boolean;
  onCancel: () => void;
  onOk: () => void;
}

export function UserModal({
  open,
  user,
  departments,
  roles,
  formKey,
  userForm,
  confirmLoading,
  onCancel,
  onOk,
}: UserModalProps) {
  const { t } = useI18n();
  const isEdit = Boolean(user);

  const deptTreeData = [
    { title: t("dept.root"), value: 0, key: 0 },
    ...departments.map((d) => ({
      title: d.name,
      value: d.id,
      key: d.id.toString(),
    })),
  ];

  const roleOptions = roles.map((r) => ({
    label: r.name,
    value: r.id,
  }));

  return (
    <DataModal
      open={open}
      title={isEdit ? t("user.edit") : t("user.create")}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={confirmLoading}
    >
      <Form key={formKey} {...userForm.formProps}>
        <Form.Item {...userForm.formItemProps.account}>
          <Input disabled={isEdit} />
        </Form.Item>
        <Form.Item {...userForm.formItemProps.password}>
          <Input.Password
            placeholder={isEdit ? "保留空白則不修改密碼" : undefined}
          />
        </Form.Item>
        <Form.Item {...userForm.formItemProps.name}>
          <Input />
        </Form.Item>
        <Form.Item {...userForm.formItemProps.employeeNo}>
          <Input />
        </Form.Item>
        <Form.Item {...userForm.formItemProps.title}>
          <Input />
        </Form.Item>
        <Form.Item {...userForm.formItemProps.departmentId}>
          <TreeSelect
            treeData={deptTreeData}
            placeholder={t("user.department")}
            allowClear
          />
        </Form.Item>
        <Form.Item {...userForm.formItemProps.roleIds}>
          <Select
            mode="multiple"
            options={roleOptions}
            placeholder={t("user.roles")}
            allowClear
          />
        </Form.Item>
        <Form.Item {...userForm.formItemProps.status}>
          <Radio.Group>
            <Radio value="active">{t("user.statusActive")}</Radio>
            <Radio value="inactive">{t("user.statusInactive")}</Radio>
            <Radio value="suspended">{t("user.statusSuspended")}</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </DataModal>
  );
}
