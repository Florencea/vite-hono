import { Form, type FormInstance, type FormItemProps, type FormProps } from "antd";

export interface UseAntdFormOptions<T> {
  formProps?: FormProps<T>;
  formItemProps?: Record<string, FormItemProps>;
}

export interface UseAntdFormReturn<T> {
  formInstance: FormInstance<T>;
  formProps: FormProps<T>;
  formItemProps: Record<string, FormItemProps>;
}

/**
 * Standardized hook for Ant Design forms.
 * Manages form instance binding, layout props, and typed form item configurations.
 */
export const useAntdForm = <T>({
  formProps,
  formItemProps = {},
}: UseAntdFormOptions<T> = {}): UseAntdFormReturn<T> => {
  const [formInstance] = Form.useForm<T>(formProps?.form);
  return {
    formInstance,
    formProps: {
      form: formInstance,
      preserve: false,
      ...formProps,
    },
    formItemProps,
  };
};
