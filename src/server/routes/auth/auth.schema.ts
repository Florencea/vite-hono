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
  account: z.string().nullable().openapi({
    description: "Account username",
    example: "admin",
  }),
});
