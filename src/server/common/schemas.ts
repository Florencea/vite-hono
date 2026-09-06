import { z } from "@hono/zod-openapi";

export const EmptyResSchema = z.object({}).openapi({
  description: "Empty response object",
});

export const ErrorResSchema = z
  .object({
    error: z.string(),
  })
  .openapi({
    description: "Error response containing an error message",
    example: { error: "Something went wrong" },
  });
