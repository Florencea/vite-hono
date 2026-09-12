import type { RouteHandler } from "@hono/zod-openapi";
import { deleteSession, getSession, setSession } from "../../auth.ts";
import type { AppEnv } from "../../common/factory.ts";
import { getDb } from "../../database/index.ts";
import { t } from "../../i18n.ts";
import type {
  getUserInfoRoute,
  loginRoute,
  logoutRoute,
} from "./auth.routes.ts";
import { authenticateUser, getAuthUserDetail } from "./auth.service.ts";

export const loginHandler: RouteHandler<typeof loginRoute, AppEnv> = async (
  c,
) => {
  const { account, password } = c.req.valid("json");
  const db = getDb(c);

  const result = await authenticateUser(db, account, password);
  if (!result.success) {
    const errorKey =
      result.reason === "user_not_found"
        ? ("errors.auth.userNotFound" as const)
        : ("errors.auth.wrongPassword" as const);
    return c.json({ error: t(c, errorKey) }, 400);
  }

  await setSession(c, {
    id: result.user.id,
    account: result.user.account,
  });

  return c.json({}, 200);
};

export const logoutHandler: RouteHandler<typeof logoutRoute, AppEnv> = async (
  c,
) => {
  const session = await getSession(c);
  if (!session?.id) {
    return c.json({ error: t(c, "errors.auth.unauthorized") }, 401);
  }

  deleteSession(c);
  return c.json({}, 200);
};

export const getUserInfoHandler: RouteHandler<
  typeof getUserInfoRoute,
  AppEnv
> = async (c) => {
  const session = await getSession(c);
  if (!session?.id) {
    return c.json(
      {
        success: false,
        id: null,
        account: null,
        name: null,
        employeeNo: null,
        title: null,
        departmentId: null,
        roles: [],
        permissions: [],
        dataScopes: [],
      },
      200,
    );
  }

  const db = getDb(c);
  const detail = await getAuthUserDetail(db, session.id);

  if (!detail) {
    return c.json(
      {
        success: false,
        id: null,
        account: null,
        name: null,
        employeeNo: null,
        title: null,
        departmentId: null,
        roles: [],
        permissions: [],
        dataScopes: [],
      },
      200,
    );
  }

  return c.json(
    {
      success: true,
      id: detail.id,
      account: detail.account,
      name: detail.name,
      employeeNo: detail.employeeNo,
      title: detail.title,
      departmentId: detail.departmentId,
      roles: detail.roles,
      permissions: detail.permissions,
      dataScopes: detail.dataScopes,
    },
    200,
  );
};
