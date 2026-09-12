import { createRoute, z } from "@hono/zod-openapi";
import { EmptyResSchema, ErrorResSchema } from "../../common/schemas.ts";
import { requirePermission } from "../../middleware/permission.ts";
import {
  CreateUserReqSchema,
  UpdateUserReqSchema,
  UserListResSchema,
  UserResSchema,
} from "./user.schema.ts";

export const listUsersRoute = createRoute({
  method: "get",
  path: "/",
  summary: "List users",
  description:
    "Get list of users filtered by caller's data scope (ALL, DEPT_AND_CHILD, DEPT, SELF, CUSTOM)",
  tags: ["User"],
  middleware: [requirePermission("system:user:read")] as const,
  responses: {
    200: {
      content: { "application/json": { schema: UserListResSchema } },
      description: "List of users",
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

export const createUserRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Create user",
  description: "Create a new user account, assign department and roles",
  tags: ["User"],
  middleware: [requirePermission("system:user:create")] as const,
  request: {
    body: {
      content: { "application/json": { schema: CreateUserReqSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: UserResSchema } },
      description: "Created user",
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

export const updateUserRoute = createRoute({
  method: "put",
  path: "/:id",
  summary: "Update user",
  description: "Update user profile, department, status, or role assignments",
  tags: ["User"],
  middleware: [requirePermission("system:user:update")] as const,
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ description: "User ID" }),
    }),
    body: {
      content: { "application/json": { schema: UpdateUserReqSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: UserResSchema } },
      description: "Updated user",
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
      description: "User not found",
    },
  },
});

export const deleteUserRoute = createRoute({
  method: "delete",
  path: "/:id",
  summary: "Delete user",
  description: "Delete user account and associations",
  tags: ["User"],
  middleware: [requirePermission("system:user:delete")] as const,
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ description: "User ID" }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: EmptyResSchema } },
      description: "Deleted successfully",
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
      description: "User not found",
    },
  },
});
