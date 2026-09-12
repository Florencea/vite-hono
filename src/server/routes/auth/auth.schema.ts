import { z } from "@hono/zod-openapi";

export const LoginReqSchema = z.object({
  account: z.string().openapi({
    description: "Account username",
    example: "admin",
  }),
  password: z.string().openapi({
    description: "Account password",
    example: "password123",
  }),
});

export const UserInfoResSchema = z.object({
  success: z.boolean().openapi({
    description: "Authentication status",
    example: true,
  }),
  id: z.number().nullable().openapi({
    description: "User ID",
    example: 1,
  }),
  account: z.string().nullable().openapi({
    description: "Account username",
    example: "admin",
  }),
  name: z.string().nullable().openapi({
    description: "Display name",
    example: "系統管理員",
  }),
  employeeNo: z.string().nullable().openapi({
    description: "Employee number",
    example: "EMP001",
  }),
  title: z.string().nullable().openapi({
    description: "Job title",
    example: "主管",
  }),
  departmentId: z.number().nullable().openapi({
    description: "Department ID",
    example: 1,
  }),
  roles: z.array(z.string()).openapi({
    description: "Assigned role codes",
    example: ["super_admin"],
  }),
  permissions: z.array(z.string()).openapi({
    description: "Effective permission codes",
    example: ["system:dept:read", "system:role:read"],
  }),
  dataScopes: z.array(z.string()).openapi({
    description: "Data scopes",
    example: ["ALL"],
  }),
});
