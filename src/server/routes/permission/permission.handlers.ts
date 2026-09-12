import type { RouteHandler } from "@hono/zod-openapi";
import { asc } from "drizzle-orm";
import type { AppEnv } from "../../common/factory.ts";
import { getDb } from "../../database/index.ts";
import { permissions } from "../../database/schema.ts";
import type { listPermissionsRoute } from "./permission.routes.ts";

export const listPermissionsHandler: RouteHandler<
  typeof listPermissionsRoute,
  AppEnv
> = async (c) => {
  const db = getDb(c);
  const items = await db
    .select()
    .from(permissions)
    .orderBy(asc(permissions.sort), asc(permissions.id));

  return c.json({ items }, 200);
};
