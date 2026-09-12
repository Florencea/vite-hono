import type { RouteHandler } from "@hono/zod-openapi";
import type { AppEnv } from "../../common/factory.ts";
import { getDb } from "../../database/index.ts";
import { t } from "../../i18n.ts";
import type {
  createDepartmentRoute,
  deleteDepartmentRoute,
  listDepartmentsRoute,
  updateDepartmentRoute,
} from "./department.routes.ts";
import {
  createDepartment,
  deleteDepartment,
  getDepartmentList,
  updateDepartment,
} from "./department.service.ts";

export const listDepartmentsHandler: RouteHandler<
  typeof listDepartmentsRoute,
  AppEnv
> = async (c) => {
  const db = getDb(c);
  const items = await getDepartmentList(db);
  return c.json({ items }, 200);
};

export const createDepartmentHandler: RouteHandler<
  typeof createDepartmentRoute,
  AppEnv
> = async (c) => {
  const db = getDb(c);
  const body = c.req.valid("json");
  const res = await createDepartment(db, body);

  if (!res.success) {
    return c.json({ error: t(c, "errors.dept.notFound") }, 400);
  }

  return c.json(res.department, 200);
};

export const updateDepartmentHandler: RouteHandler<
  typeof updateDepartmentRoute,
  AppEnv
> = async (c) => {
  const db = getDb(c);
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  const res = await updateDepartment(db, id, body);
  if (!res.success) {
    return c.json({ error: t(c, "errors.dept.notFound") }, 404);
  }

  return c.json(res.department, 200);
};

export const deleteDepartmentHandler: RouteHandler<
  typeof deleteDepartmentRoute,
  AppEnv
> = async (c) => {
  const db = getDb(c);
  const { id } = c.req.valid("param");

  const res = await deleteDepartment(db, id);
  if (!res.success) {
    if (res.reason === "not_found") {
      return c.json({ error: t(c, "errors.dept.notFound") }, 404);
    }
    if (res.reason === "has_children") {
      return c.json({ error: t(c, "errors.dept.hasChildren") }, 400);
    }
    return c.json({ error: t(c, "errors.dept.hasUsers") }, 400);
  }

  return c.json({}, 200);
};
