import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Card, Result } from "antd";
import { useI18n } from "../hooks/useI18n.ts";

export const Route = createFileRoute("/403")({
  component: ForbiddenPage,
});

function ForbiddenPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <Card className="flex h-full items-center justify-center">
      <Result
        status="403"
        title={t("forbidden.title")}
        subTitle={t("forbidden.description")}
        extra={
          <Button
            type="primary"
            onClick={() => {
              void navigate({ to: "/" });
            }}
          >
            {t("forbidden.backHome")}
          </Button>
        }
      />
    </Card>
  );
}
