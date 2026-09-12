import { z } from "@hono/zod-openapi";
import { dataScopeEnum } from "../../database/schema.ts";

export const RoleResSchema = z.object({
  id: z.number().openapi({ description: "Role ID", example: 1 }),
  code: z
    .string()
    .openapi({ description: "Role unique code", example: "dept_manager" }),
  name: z
    .string()
    .openapi({ description: "Role display name", example: "部門主管" }),
  description: z
    .string()
    .nullable()
    .openapi({ description: "Role description", example: "管理部門資料" }),
  dataScope: z
    .enum(dataScopeEnum)
    .openapi({ description: "Data scope", example: "DEPT_AND_CHILD" }),
  sort: z.number().openapi({ description: "Sort order", example: 1 }),
  isSystem: z
    .boolean()
    .openapi({ description: "Is system preset role", example: false }),
  permissionIds: z
    .array(z.number())
    .openapi({ description: "Assigned permission IDs", example: [1, 2] }),
  departmentIds: z
    .array(z.number())
    .openapi({ description: "Custom assigned department IDs", example: [] }),
});

export const RoleListResSchema = z.object({
  items: z.array(RoleResSchema).openapi({ description: "List of roles" }),
});

export const CreateRoleReqSchema = z.object({
  code: z
    .string()
    .min(1)
    .openapi({ description: "Role code", example: "sales_lead" }),
  name: z
    .string()
    .min(1)
    .openapi({ description: "Role name", example: "業務組長" }),
  description: z
    .string()
    .optional()
    .openapi({ description: "Role description" }),
  dataScope: z
    .enum(dataScopeEnum)
    .openapi({ description: "Data scope", example: "DEPT" }),
  sort: z
    .number()
    .optional()
    .default(0)
    .openapi({ description: "Sort order", example: 1 }),
  permissionIds: z
    .array(z.number())
    .optional()
    .default([])
    .openapi({ description: "Permission IDs" }),
  departmentIds: z
    .array(z.number())
    .optional()
    .default([])
    .openapi({ description: "Custom Department IDs" }),
});

export const UpdateRoleReqSchema = z.object({
  name: z
    .string()
    .min(1)
    .optional()
    .openapi({ description: "Role name", example: "業務組長" }),
  description: z
    .string()
    .nullable()
    .optional()
    .openapi({ description: "Role description" }),
  dataScope: z
    .enum(dataScopeEnum)
    .optional()
    .openapi({ description: "Data scope", example: "DEPT" }),
  sort: z
    .number()
    .optional()
    .openapi({ description: "Sort order", example: 1 }),
  permissionIds: z
    .array(z.number())
    .optional()
    .openapi({ description: "Permission IDs" }),
  departmentIds: z
    .array(z.number())
    .optional()
    .openapi({ description: "Custom Department IDs" }),
});
