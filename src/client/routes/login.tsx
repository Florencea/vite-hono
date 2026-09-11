import { createFileRoute } from "@tanstack/react-router";
import { Button, Card, Form, Input } from "antd";
import { z } from "zod";
import { I18nSwitcher } from "../components/i18n-switcher";
import { useAuth } from "../libs/useAuth";
import { useI18n } from "../libs/useI18n";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: Page,
});

function Page() {
  const { t } = useI18n();
  const { loginForm, login } = useAuth();
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card
        title={t("auth.login")}
        extra={[<I18nSwitcher key="i18nswicher" />]}
      >
        <Form {...loginForm.formProps}>
          <Form.Item {...loginForm.formItemProps.account}>
            <Input autoFocus />
          </Form.Item>
          <Form.Item {...loginForm.formItemProps.password}>
            <Input.Password />
          </Form.Item>
          <Button
            loading={login.isPending}
            disabled={login.isPending}
            type="primary"
            htmlType="submit"
            block
          >
            {t("common.submit")}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
