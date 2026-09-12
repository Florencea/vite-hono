import { createRoute, z } from "@hono/zod-openapi";
import { EmptyResSchema, ErrorResSchema } from "../../common/schemas.ts";
import { requirePermission } from "../../middleware/permission.ts";
import {
  CreateRoleReqSchema,
  RoleListResSchema,
  RoleResSchema,
  UpdateRoleReqSchema,
} from "./role.schema.ts";

export const listRolesRoute = createRoute({
  method: "get",
  path: "/",
  summary: "List roles",
  description:
    "Get list of all roles with their assigned permissions and data scopes",
  tags: ["Role"],
  middleware: [requirePermission("system:role:read")] as const,
  responses: {
    200: {
      content: { "application/json": { schema: RoleListResSchema } },
      description: "List of roles",
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

export const createRoleRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Create role",
  description: "Create a new role with permissions and data scope",
  tags: ["Role"],
  middleware: [requirePermission("system:role:create")] as const,
  request: {
    body: {
      content: { "application/json": { schema: CreateRoleReqSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: RoleResSchema } },
      description: "Created role",
    },
    400: {
      content: { "application/json": { schema: ErrorResSchema } },
      description: "Bad request",
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

export const updateRoleRoute = createRoute({
  method: "put",
  path: "/:id",
  summary: "Update role",
  description: "Update role information, permissions, or data scope",
  tags: ["Role"],
  middleware: [requirePermission("system:role:update")] as const,
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ description: "Role ID" }),
    }),
    body: {
      content: { "application/json": { schema: UpdateRoleReqSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: RoleResSchema } },
      description: "Updated role",
    },
    400: {
      content: { "application/json": { schema: ErrorResSchema } },
      description: "Bad request",
    },
    401: {
      content: { "application/json": { schema: ErrorResSchema } },
      description: "Unauthorized",
    },
    403: {
      content: { "application/json": { schema: ErrorResSchema } },
      description: "Forbidden",
    },
    404: {
      content: { "application/json": { schema: ErrorResSchema } },
      description: "Role not found",
    },
  },
});

export const deleteRoleRoute = createRoute({
  method: "delete",
  path: "/:id",
  summary: "Delete role",
  description: "Delete a custom role (system roles cannot be deleted)",
  tags: ["Role"],
  middleware: [requirePermission("system:role:delete")] as const,
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ description: "Role ID" }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: EmptyResSchema } },
      description: "Deleted successfully",
    },
    400: {
      content: { "application/json": { schema: ErrorResSchema } },
      description: "System role cannot be deleted",
    },
    401: {
      content: { "application/json": { schema: ErrorResSchema } },
      description: "Unauthorized",
    },
    403: {
      content: { "application/json": { schema: ErrorResSchema } },
      description: "Forbidden",
    },
    404: {
      content: { "application/json": { schema: ErrorResSchema } },
      description: "Role not found",
    },
  },
});
