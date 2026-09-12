import { Form, Input, InputNumber, type ModalProps, TreeSelect } from "antd";
import type { useDepartments } from "../../hooks/useDepartments.ts";
import { useI18n } from "../../hooks/useI18n.ts";
import type { DepartmentItem } from "../../types/api.ts";
import { DataModal } from "../common/DataModal.tsx";

export interface DepartmentModalProps extends Pick<ModalProps, "open"> {
  department: DepartmentItem | null;
  departments: DepartmentItem[];
  formKey: string;
  deptForm: ReturnType<typeof useDepartments>["deptForm"];
  confirmLoading: boolean;
  onCancel: () => void;
  onOk: () => void;
}

export function DepartmentModal({
  open,
  department,
  departments,
  formKey,
  deptForm,
  confirmLoading,
  onCancel,
  onOk,
}: DepartmentModalProps) {
  const { t } = useI18n();
  const isEdit = Boolean(department);

  const treeSelectData = [
    { title: t("dept.root"), value: 0, key: 0 },
    ...departments
      .filter((d) => d.id !== department?.id)
      .map((d) => ({
        title: d.name,
        value: d.id,
        key: d.id.toString(),
      })),
  ];

  return (
    <DataModal
      open={open}
      title={isEdit ? t("dept.edit") : t("dept.create")}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={confirmLoading}
    >
      <Form key={formKey} {...deptForm.formProps}>
        <Form.Item {...deptForm.formItemProps.name}>
          <Input />
        </Form.Item>
        <Form.Item {...deptForm.formItemProps.parentId}>
          <TreeSelect
            treeData={treeSelectData}
            placeholder={t("dept.parent")}
            allowClear
          />
        </Form.Item>
        <Form.Item {...deptForm.formItemProps.sort}>
          <InputNumber min={0} className="w-full" />
        </Form.Item>
      </Form>
    </DataModal>
  );
}
