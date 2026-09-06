import { Scalar } from "@scalar/hono-api-reference";
import { COOKIE_NAME, DOC_ROUTE, DOC_TITLE, VERSION } from "./config.ts";

/**
 * OpenAPI 3.0 configuration specification
 */
export const openapiConfig = {
  openapi: "3.0.0",
  info: {
    title: DOC_TITLE,
    version: VERSION,
    description: "- All datetime strings use ISO8601 (e.g. `2023-07-30T14:00:30.590Z`)",
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
  pageTitle: DOC_TITLE,
  spec: {
    url: `${DOC_ROUTE}/doc.json`,
  },
});
