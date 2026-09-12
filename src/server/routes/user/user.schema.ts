import { z } from "@hono/zod-openapi";
import { userStatusEnum } from "../../database/schema.ts";

export const UserResSchema = z.object({
  id: z.number().openapi({ description: "User ID", example: 1 }),
  uid: z.string().openapi({ description: "Unique UUID", example: "uuid-123" }),
  account: z
    .string()
    .openapi({ description: "Account username", example: "john_doe" }),
  name: z
    .string()
    .nullable()
    .openapi({ description: "Display name", example: "王小明" }),
  employeeNo: z
    .string()
    .nullable()
    .openapi({ description: "Employee ID", example: "EMP001" }),
  title: z
    .string()
    .nullable()
    .openapi({ description: "Job title", example: "資深工程師" }),
  status: z
    .enum(userStatusEnum)
    .openapi({ description: "Account status", example: "active" }),
  departmentId: z
    .number()
    .nullable()
    .openapi({ description: "Department ID", example: 2 }),
  reportsToId: z
    .number()
    .nullable()
    .openapi({ description: "Reports to User ID", example: 1 }),
  roleIds: z
    .array(z.number())
    .openapi({ description: "Assigned role IDs", example: [1] }),
  isSystem: z
    .boolean()
    .default(false)
    .openapi({ description: "System default user", example: false }),
  createdAt: z.date().openapi({ description: "Created timestamp" }),
  updatedAt: z.date().openapi({ description: "Updated timestamp" }),
});

export const UserListResSchema = z.object({
  items: z.array(UserResSchema).openapi({ description: "List of users" }),
});

export const CreateUserReqSchema = z.object({
  account: z
    .string()
    .min(1)
    .openapi({ description: "Account username", example: "john_doe" }),
  password: z
    .string()
    .min(6)
    .openapi({ description: "Password", example: "secret123" }),
  name: z
    .string()
    .optional()
    .openapi({ description: "Name", example: "王小明" }),
  employeeNo: z
    .string()
    .optional()
    .openapi({ description: "Employee number", example: "EMP001" }),
  title: z
    .string()
    .optional()
    .openapi({ description: "Job title", example: "工程師" }),
  status: z
    .enum(userStatusEnum)
    .optional()
    .default("active")
    .openapi({ description: "Status" }),
  departmentId: z
    .number()
    .nullable()
    .optional()
    .openapi({ description: "Department ID", example: 2 }),
  reportsToId: z
    .number()
    .nullable()
    .optional()
    .openapi({ description: "Reports to user ID" }),
  roleIds: z
    .array(z.number())
    .optional()
    .default([])
    .openapi({ description: "Role IDs" }),
});

export const UpdateUserReqSchema = z.object({
  password: z
    .string()
    .min(6)
    .optional()
    .openapi({ description: "New password" }),
  name: z.string().nullable().optional().openapi({ description: "Name" }),
  employeeNo: z
    .string()
    .nullable()
    .optional()
    .openapi({ description: "Employee number" }),
  title: z.string().nullable().optional().openapi({ description: "Job title" }),
  status: z.enum(userStatusEnum).optional().openapi({ description: "Status" }),
  departmentId: z
    .number()
    .nullable()
    .optional()
    .openapi({ description: "Department ID" }),
  reportsToId: z
    .number()
    .nullable()
    .optional()
    .openapi({ description: "Reports to user ID" }),
  roleIds: z.array(z.number()).optional().openapi({ description: "Role IDs" }),
});
