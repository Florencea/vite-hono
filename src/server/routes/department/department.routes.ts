import { createRoute, z } from "@hono/zod-openapi";
import { EmptyResSchema, ErrorResSchema } from "../../common/schemas.ts";
import { requirePermission } from "../../middleware/permission.ts";
import {
  CreateDepartmentReqSchema,
  DepartmentListResSchema,
  DepartmentResSchema,
  UpdateDepartmentReqSchema,
} from "./department.schema.ts";

export const listDepartmentsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "List departments",
  description: "Get list of all departments in tree order",
  tags: ["Department"],
  middleware: [requirePermission("system:dept:read")] as const,
  responses: {
    200: {
      content: { "application/json": { schema: DepartmentListResSchema } },
      description: "List of departments",
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

export const createDepartmentRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Create department",
  description: "Add a new department with automatic path hierarchy",
  tags: ["Department"],
  middleware: [requirePermission("system:dept:create")] as const,
  request: {
    body: {
      content: { "application/json": { schema: CreateDepartmentReqSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: DepartmentResSchema } },
      description: "Created department",
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

export const updateDepartmentRoute = createRoute({
  method: "put",
  path: "/:id",
  summary: "Update department",
  description: "Update department name, parent, or sort order",
  tags: ["Department"],
  middleware: [requirePermission("system:dept:update")] as const,
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ description: "Department ID" }),
    }),
    body: {
      content: { "application/json": { schema: UpdateDepartmentReqSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: DepartmentResSchema } },
      description: "Updated department",
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
      description: "Department not found",
    },
  },
});

export const deleteDepartmentRoute = createRoute({
  method: "delete",
  path: "/:id",
  summary: "Delete department",
  description: "Delete an empty department without children or assigned users",
  tags: ["Department"],
  middleware: [requirePermission("system:dept:delete")] as const,
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ description: "Department ID" }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: EmptyResSchema } },
      description: "Deleted successfully",
    },
    400: {
      content: { "application/json": { schema: ErrorResSchema } },
      description: "Cannot delete due to children or users",
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
      description: "Department not found",
    },
  },
});
