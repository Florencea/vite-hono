import type { RouteHandler } from "@hono/zod-openapi";
import type { AppEnv } from "../../common/factory.ts";
import { getDb } from "../../database/index.ts";
import { t } from "../../i18n.ts";
import type {
  createRoleRoute,
  deleteRoleRoute,
  listRolesRoute,
  updateRoleRoute,
} from "./role.routes.ts";
import {
  createRole,
  deleteRole,
  getRoleList,
  updateRole,
} from "./role.service.ts";

export const listRolesHandler: RouteHandler<
  typeof listRolesRoute,
  AppEnv
> = async (c) => {
  const db = getDb(c);
  const items = await getRoleList(db);
  return c.json({ items }, 200);
};

export const createRoleHandler: RouteHandler<
  typeof createRoleRoute,
  AppEnv
> = async (c) => {
  const db = getDb(c);
  const body = c.req.valid("json");
  const res = await createRole(db, body);

  if (!res.success) {
    return c.json({ error: t(c, "errors.role.codeExists") }, 400);
  }

  return c.json(res.role, 200);
};

export const updateRoleHandler: RouteHandler<
  typeof updateRoleRoute,
  AppEnv
> = async (c) => {
  const db = getDb(c);
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  const res = await updateRole(db, id, body);
  if (!res.success) {
    return c.json({ error: t(c, "errors.role.notFound") }, 404);
  }

  return c.json(res.role, 200);
};

export const deleteRoleHandler: RouteHandler<
  typeof deleteRoleRoute,
  AppEnv
> = async (c) => {
  const db = getDb(c);
  const { id } = c.req.valid("param");

  const res = await deleteRole(db, id);
  if (!res.success) {
    if (res.reason === "not_found") {
      return c.json({ error: t(c, "errors.role.notFound") }, 404);
    }
    return c.json({ error: t(c, "errors.role.systemRoleProtected") }, 400);
  }

  return c.json({}, 200);
};
