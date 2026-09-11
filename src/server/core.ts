import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { CORS_ORIGIN, ENABLE_OPENAPI } from "./config.ts";
import { i18nMiddleware, t } from "./i18n.ts";
import { openapiConfig, scalarReference } from "./openapi.ts";
import { apiRouter } from "./router.ts";

/**
 * Creates the core Hono application instance containing:
 * - Essential security, compression, CORS, and i18n middleware
 * - API route controllers (Hono RPC)
 * - OpenAPI 3.0 spec endpoint & Scalar documentation UI
 */
export function createCoreApp() {
  const app = new OpenAPIHono();

  // Middleware
  app.use("*", secureHeaders());
  app.use("*", cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use("*", i18nMiddleware);

  // Business API Routes
  app.route("/api", apiRouter);

  // Localized 404 for unhandled API endpoints
  app.all("/api/*", (c) => {
    return c.json({ error: t(c, "errors.common.notFound") }, 404);
  });

  // Global localized 500 error handler
  app.onError((_err, c) => {
    return c.json({ error: t(c, "errors.common.internalServerError") }, 500);
  });

  // OpenAPI Specification and Scalar API Reference
  if (ENABLE_OPENAPI) {
    // OpenAPI 3.0 JSON spec endpoint
    app.doc("/openapi/doc.json", openapiConfig);

    // Scalar interactive API reference UI
    app.get("/openapi", scalarReference);
    app.get("/openapi/", scalarReference);
  }

  return app;
}
