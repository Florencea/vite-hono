import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { OpenAPIHono } from "@hono/zod-openapi";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { existsSync, readFileSync } from "node:fs";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { join, posix } from "node:path";
import { cwd } from "node:process";
import { createServer as createViteServer } from "vite";
import {
  API_ENDPOINT_RPC,
  BASE,
  CORS_ORIGIN,
  DOC_ROUTE,
  DOC_TYPEGEN_ROUTE,
  ENABLE_CLIENT,
  ENABLE_COMPRESSION,
  ENABLE_OPENAPI,
  ENABLE_SERVER,
  ENABLE_TYPEGEN,
  IS_PRODUCTION,
  OUTDIR,
  PORT,
  SERVER_READY_MESSAGE,
  SWAGGER_UI_OPTIONS,
} from "./config.js";
import { i18nMiddleware } from "./i18n.js";
import { apiRouter } from "./router.js";
import { typegenRouter } from "./typegen.js";

const app = new OpenAPIHono();

/**
 * Essential security & utility middleware
 */
if (ENABLE_SERVER) {
  if (ENABLE_COMPRESSION) {
    app.use("*", compress());
  }

  if (IS_PRODUCTION) {
    app.use("*", secureHeaders());
  }

  if (!ENABLE_CLIENT) {
    app.use("*", cors({ origin: CORS_ORIGIN, credentials: true }));
  }

  app.use("*", i18nMiddleware);
}

/**
 * API controllers
 */
if (ENABLE_SERVER) {
  app.route(API_ENDPOINT_RPC, apiRouter);
}

/**
 * OpenAPI and Typegen routes
 */
if (ENABLE_OPENAPI) {
  const { openapiConfig, renderSwaggerUiHtml } = await import("./openapi/index.js");
  const docJsonPath = posix.join(DOC_ROUTE, "doc.json");

  // OpenAPI JSON spec endpoint
  app.doc(docJsonPath, openapiConfig);

  // Swagger UI page (support trailing slash and redirect)
  const renderSwagger = () =>
    renderSwaggerUiHtml({
      docUrl: docJsonPath,
      options: SWAGGER_UI_OPTIONS,
    });

  app.get(DOC_ROUTE, (c) => {
    const url = new URL(c.req.url);
    if (!url.pathname.endsWith("/")) {
      return c.redirect(`${DOC_ROUTE}/`, 301);
    }
    return c.html(renderSwagger());
  });

  app.get(`${DOC_ROUTE}/`, (c) => {
    return c.html(renderSwagger());
  });
}

if (ENABLE_TYPEGEN) {
  app.route(DOC_TYPEGEN_ROUTE, typegenRouter);
  // Also register /typegen as fallback for any relative URL resolving differences
  app.route("/typegen", typegenRouter);
}

interface NodeBindings {
  incoming?: IncomingMessage;
  outgoing?: ServerResponse;
}

/**
 * Client SPA serving
 */
let viteDevServer: Awaited<ReturnType<typeof createViteServer>> | undefined;

if (ENABLE_CLIENT) {
  if (IS_PRODUCTION) {
    // Serve production build static files
    app.use(
      "*",
      serveStatic({
        root: OUTDIR,
      }),
    );

    // Fallback for SPA routing
    app.get("*", (c) => {
      const indexPath = join(OUTDIR, "index.html");
      if (existsSync(indexPath)) {
        return c.html(readFileSync(indexPath, "utf-8"));
      }
      return c.text("Client build not found", 404);
    });
  } else {
    // Development mode with Vite Dev Server middleware
    viteDevServer = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: cwd(),
      base: BASE,
    });

    app.use("*", async (c, next) => {
      const url = c.req.path;
      // Skip API, OpenAPI, and Typegen routes
      if (
        url.startsWith(API_ENDPOINT_RPC) ||
        url.startsWith("/api") ||
        url.startsWith("/typegen") ||
        (ENABLE_OPENAPI && url.startsWith(DOC_ROUTE)) ||
        (ENABLE_TYPEGEN && url.startsWith(DOC_TYPEGEN_ROUTE))
      ) {
        return next();
      }

      return new Promise<Response>((resolve, reject) => {
        const nodeEnv = c.env as NodeBindings | undefined;
        const rawReq = nodeEnv?.incoming;
        const rawRes = nodeEnv?.outgoing;

        if (viteDevServer && rawReq && rawRes) {
          viteDevServer.middlewares(rawReq, rawRes, () => {
            try {
              const templatePath = join(cwd(), "index.html");
              const templateRaw = readFileSync(templatePath, "utf-8");
              void viteDevServer!
                .transformIndexHtml(c.req.url, templateRaw)
                .then((template) => {
                  resolve(c.html(template));
                })
                .catch((err: unknown) => {
                  reject(err instanceof Error ? err : new Error(String(err)));
                });
            } catch (e) {
              reject(e instanceof Error ? e : new Error(String(e)));
            }
          });
        } else {
          void next().then(() => resolve(c.res));
        }
      });
    });
  }
}

export type AppType = typeof apiRouter;
export default app;

/**
 * Server startup for Node.js
 */
let server: Server | undefined;

if (process.env.NODE_ENV !== "test") {
  server = serve(
    {
      fetch: app.fetch,
      port: PORT,
    },
    () => {
      console.info(SERVER_READY_MESSAGE);
    },
  ) as unknown as Server;
}

const gracefulShutdown = () => {
  setTimeout(() => {
    process.exit(0);
  }, 1000).unref();

  if (server) {
    server.closeAllConnections?.();
    server.close(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGUSR2", gracefulShutdown);
