import { createFileRoute } from "@tanstack/react-router";
import { Button, Card, Flex, Form, Input } from "antd";
import { z } from "zod";
import { I18nSwitcher } from "../components/I18nSwitcher.tsx";
import { useAuth } from "../hooks/useAuth.ts";
import { useI18n } from "../hooks/useI18n.ts";

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
    <Flex align="center" justify="center" className="h-full w-full">
      <Card title={t("auth.login")} extra={<I18nSwitcher />}>
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
    </Flex>
  );
}
