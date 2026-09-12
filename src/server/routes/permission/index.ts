import { createRouter } from "../../common/factory.ts";
import { listPermissionsHandler } from "./permission.handlers.ts";
import { listPermissionsRoute } from "./permission.routes.ts";

export const permissionRouter = createRouter().openapi(
  listPermissionsRoute,
  listPermissionsHandler,
);
