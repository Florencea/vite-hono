import { OpenAPIHono } from "@hono/zod-openapi";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import {
  API_ENDPOINT_RPC,
  CORS_ORIGIN,
  DOC_ROUTE,
  ENABLE_OPENAPI,
  IS_PRODUCTION,
} from "./config.ts";
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
  if (IS_PRODUCTION) {
    app.use("*", compress());
  }
  app.use("*", secureHeaders());
  app.use("*", cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use("*", i18nMiddleware);

  // Business API Routes
  app.route(API_ENDPOINT_RPC, apiRouter);

  // Localized 404 for unhandled API endpoints
  app.all(`${API_ENDPOINT_RPC}/*`, (c) => {
    return c.json({ error: t(c, "errors.common.notFound") }, 404);
  });

  // Global localized 500 error handler
  app.onError((_err, c) => {
    return c.json({ error: t(c, "errors.common.internalServerError") }, 500);
  });

  // OpenAPI Specification and Scalar API Reference
  if (ENABLE_OPENAPI) {
    const docJsonPath = `${DOC_ROUTE}/doc.json`;

    // OpenAPI 3.0 JSON spec endpoint
    app.doc(docJsonPath, openapiConfig);

    // Scalar interactive API reference UI
    app.get(DOC_ROUTE, scalarReference);
    app.get(`${DOC_ROUTE}/`, scalarReference);
  }

  return app;
}
