import { createRoute } from "@hono/zod-openapi";
import { ErrorResSchema } from "../../common/schemas.ts";
import { requirePermission } from "../../middleware/permission.ts";
import { PermissionListResSchema } from "./permission.schema.ts";

export const listPermissionsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "List permissions",
  description: "Get list of all system permissions for role matrix assignment",
  tags: ["Permission"],
  middleware: [requirePermission("system:role:read")] as const,
  responses: {
    200: {
      content: { "application/json": { schema: PermissionListResSchema } },
      description: "List of all permissions",
    },
    401: {
      content: { "application/json": { schema: ErrorResSchema } },
      description: "Unauthorized",
    },
    403: {
      content: { "application/json": { schema: ErrorResSchema } },
      description: "Forbidden",
    },
  },
});
