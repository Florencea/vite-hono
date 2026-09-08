import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { existsSync, readFileSync } from "node:fs";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { join } from "node:path";
import { cwd } from "node:process";
import { createServer as createViteServer } from "vite";
import {
  API_ENDPOINT_RPC,
  BASE,
  DOC_ROUTE,
  ENABLE_OPENAPI,
  IS_PRODUCTION,
  OUTDIR,
  PORT,
  SERVER_READY_MESSAGE,
} from "./config.ts";
import { createCoreApp } from "./core.ts";
import { apiRouter } from "./router.ts";

const app = createCoreApp();

interface NodeBindings {
  incoming?: IncomingMessage;
  outgoing?: ServerResponse;
}

/**
 * Client SPA serving
 * - Dev: Vite Dev Server with HMR
 * - Prod (Mode 1 Fullstack): Automatic static file & SPA fallback when dist/client/index.html exists
 * - Prod (Mode 2/3 Pure API): Untouched if no client build output exists
 */
if (IS_PRODUCTION) {
  const indexPath = join(OUTDIR, "index.html");
  if (existsSync(indexPath)) {
    // Mode 1 (Fullstack): Serve built static client assets
    app.use("*", serveStatic({ root: OUTDIR }));

    // SPA fallback route
    app.get("*", (c) => c.html(readFileSync(indexPath, "utf-8")));
  }
} else {
  // Development mode: Vite Dev Server middleware
  const viteDevServer = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
    root: cwd(),
    base: BASE,
  });

  app.use("*", async (c, next) => {
    const url = c.req.path;
    // Skip backend API and OpenAPI routes
    if (
      url.startsWith(API_ENDPOINT_RPC) ||
      (ENABLE_OPENAPI && url.startsWith(DOC_ROUTE))
    ) {
      return next();
    }

    return new Promise<Response>((resolve, reject) => {
      const nodeEnv = c.env as NodeBindings | undefined;
      const rawReq = nodeEnv?.incoming;
      const rawRes = nodeEnv?.outgoing;

      if (rawReq && rawRes) {
        viteDevServer.middlewares(rawReq, rawRes, () => {
          try {
            const templatePath = join(cwd(), "index.html");
            const templateRaw = readFileSync(templatePath, "utf-8");
            void viteDevServer
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
        void next().then(() => {
          resolve(c.res);
        });
      }
    });
  });
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
    server.closeAllConnections();
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
