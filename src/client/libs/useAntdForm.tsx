import {
  Form,
  type FormInstance,
  type FormItemProps,
  type FormProps,
} from "antd";

type FormItemPropsT<T> = FormItemProps<T> & {
  name: T;
  label: string;
  rules: [{ required: boolean }];
};

interface UseAntdFormT<T> {
  formProps: FormProps<T>;
  formItemProps: { [k in keyof T]: FormItemPropsT<k> };
}

interface UseAntdFormRT<T> {
  formInstance: FormInstance<T>;
  formProps: FormProps<T>;
  formItemProps: { [k in keyof T]: FormItemPropsT<k> };
}

export const useAntdForm = <T,>({
  formProps,
  formItemProps,
}: UseAntdFormT<T>): UseAntdFormRT<T> => {
  const [formInstance] = Form.useForm<T>();
  return {
    formInstance,
    formProps: {
      form: formInstance,
      ...formProps,
    },
    formItemProps,
  };
};
