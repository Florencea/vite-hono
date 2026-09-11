import { createFileRoute } from "@tanstack/react-router";
import { Card, Typography } from "antd";
import { useI18n } from "../hooks/useI18n.ts";

const { Title, Paragraph } = Typography;

export const Route = createFileRoute("/user")({
  component: Page,
});

function Page() {
  const { t } = useI18n();

  return (
    <Card>
      <Title level={3}>{t("routes./user")}</Title>
      <Paragraph type="secondary">Hello /user!</Paragraph>
    </Card>
  );
}
