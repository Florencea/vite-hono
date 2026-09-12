import { z } from "@hono/zod-openapi";

export const DepartmentResSchema = z.object({
  id: z.number().openapi({ description: "Department ID", example: 1 }),
  parentId: z
    .number()
    .nullable()
    .openapi({ description: "Parent department ID", example: null }),
  name: z.string().openapi({ description: "Department name", example: "總部" }),
  path: z
    .string()
    .openapi({ description: "Materialized path", example: "/1/" }),
  sort: z.number().openapi({ description: "Display sort order", example: 1 }),
  leaderId: z
    .number()
    .nullable()
    .openapi({ description: "Department leader user ID", example: null }),
});

export const DepartmentListResSchema = z.object({
  items: z
    .array(DepartmentResSchema)
    .openapi({ description: "List of departments" }),
});

export const CreateDepartmentReqSchema = z.object({
  name: z
    .string()
    .min(1)
    .openapi({ description: "Department name", example: "研發部" }),
  parentId: z
    .number()
    .nullable()
    .optional()
    .openapi({ description: "Parent ID", example: 1 }),
  sort: z
    .number()
    .optional()
    .default(0)
    .openapi({ description: "Sort order", example: 1 }),
  leaderId: z
    .number()
    .nullable()
    .optional()
    .openapi({ description: "Leader User ID", example: null }),
});

export const UpdateDepartmentReqSchema = z.object({
  name: z
    .string()
    .min(1)
    .optional()
    .openapi({ description: "Department name", example: "研發部" }),
  parentId: z
    .number()
    .nullable()
    .optional()
    .openapi({ description: "Parent ID", example: 1 }),
  sort: z
    .number()
    .optional()
    .openapi({ description: "Sort order", example: 1 }),
  leaderId: z
    .number()
    .nullable()
    .optional()
    .openapi({ description: "Leader User ID", example: null }),
});
