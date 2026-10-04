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

export const IdParamSchema = z.object({
  id: z.coerce.number().openapi({
    description: "Resource ID",
    example: 1,
  }),
});

const TableInfoRowSchema = z.object({
  name: z.string(),
});

export const TableInfoSchema = z.array(TableInfoRowSchema);

export const JsonRecordSchema = z.record(z.string(), z.unknown());
