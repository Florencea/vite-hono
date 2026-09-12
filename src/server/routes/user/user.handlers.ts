import type { RouteHandler } from "@hono/zod-openapi";
import type { AppEnv } from "../../common/factory.ts";
import { getDb } from "../../database/index.ts";
import { t } from "../../i18n.ts";
import type {
  createUserRoute,
  deleteUserRoute,
  listUsersRoute,
  updateUserRoute,
} from "./user.routes.ts";
import {
  createUser,
  deleteUser,
  getUserList,
  updateUser,
} from "./user.service.ts";

export const listUsersHandler: RouteHandler<
  typeof listUsersRoute,
  AppEnv
> = async (c) => {
  const db = getDb(c);
  const user = c.get("user");
  if (!user) {
    return c.json({ error: t(c, "errors.auth.unauthorized") }, 401);
  }

  const items = await getUserList(db, user);
  return c.json({ items }, 200);
};

export const createUserHandler: RouteHandler<
  typeof createUserRoute,
  AppEnv
> = async (c) => {
  const db = getDb(c);
  const body = c.req.valid("json");
  const res = await createUser(db, body);

  if (!res.success) {
    return c.json({ error: t(c, "errors.user.accountExists") }, 400);
  }

  return c.json(res.user, 200);
};

export const updateUserHandler: RouteHandler<
  typeof updateUserRoute,
  AppEnv
> = async (c) => {
  const db = getDb(c);
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  const res = await updateUser(db, id, body);
  if (!res.success) {
    return c.json({ error: t(c, "errors.user.notFound") }, 404);
  }

  return c.json(res.user, 200);
};

export const deleteUserHandler: RouteHandler<
  typeof deleteUserRoute,
  AppEnv
> = async (c) => {
  const db = getDb(c);
  const { id } = c.req.valid("param");

  const res = await deleteUser(db, id);
  if (!res.success) {
    return c.json({ error: t(c, "errors.user.notFound") }, 404);
  }

  return c.json({}, 200);
};
