import type { RouteHandler } from "@hono/zod-openapi";
import { deleteSession, getSession, setSession } from "../../auth.ts";
import type { AppEnv } from "../../common/factory.ts";
import { getDb } from "../../database/index.ts";
import { t } from "../../i18n.ts";
import type { getUserInfoRoute, loginRoute, logoutRoute } from "./auth.routes.ts";
import { authenticateUser } from "./auth.service.ts";

export const loginHandler: RouteHandler<typeof loginRoute, AppEnv> = async (c) => {
  const { account, password } = c.req.valid("json");
  const db = getDb(c);

  const result = await authenticateUser(db, account, password);
  if (!result.success) {
    const errorKey =
      result.reason === "user_not_found"
        ? "server.auth.user not found"
        : "server.auth.wrong password";
    return c.json({ error: t(c, errorKey) }, 400);
  }

  await setSession(c, {
    id: result.user.id,
    account: result.user.account,
  });

  return c.json({}, 200);
};

export const logoutHandler: RouteHandler<typeof logoutRoute, AppEnv> = async (c) => {
  const session = await getSession(c);
  if (!session?.id) {
    return c.json({ error: "UNAUTHORIZED" }, 401);
  }

  deleteSession(c);
  return c.json({}, 200);
};

export const getUserInfoHandler: RouteHandler<typeof getUserInfoRoute, AppEnv> = async (c) => {
  const session = await getSession(c);
  return c.json(
    {
      success: !!session?.id,
      account: session?.account ?? null,
    },
    200,
  );
};
