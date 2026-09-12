import { z } from "@hono/zod-openapi";

const PermissionResSchema = z.object({
  id: z.number().openapi({ description: "Permission ID", example: 1 }),
  parentId: z
    .number()
    .nullable()
    .openapi({ description: "Parent permission ID", example: null }),
  code: z.string().openapi({
    description: "Permission unique code",
    example: "system:dept:read",
  }),
  name: z
    .string()
    .openapi({ description: "Display name", example: "查看部門" }),
  type: z
    .enum(["menu", "button"])
    .openapi({ description: "Permission type", example: "menu" }),
  sort: z.number().openapi({ description: "Sort order", example: 1 }),
});

export const PermissionListResSchema = z.object({
  items: z
    .array(PermissionResSchema)
    .openapi({ description: "List of all permissions" }),
});
