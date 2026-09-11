import { Scalar } from "@scalar/hono-api-reference";
import { COOKIE_NAME } from "./auth.ts";

/**
 * OpenAPI 3.0 configuration specification
 */
export const openapiConfig = {
  openapi: "3.0.0",
  info: {
    title: "API Reference",
    version: "1.0.0",
    description:
      "- All datetime strings use ISO8601 (e.g. `2023-07-30T14:00:30.590Z`)",
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey" as const,
        in: "cookie" as const,
        name: COOKIE_NAME,
      },
    },
  },
};

/**
 * Scalar API reference middleware handler
 */
export const scalarReference = Scalar({
  pageTitle: "API Reference",
  spec: {
    url: "/openapi/doc.json",
  },
});
