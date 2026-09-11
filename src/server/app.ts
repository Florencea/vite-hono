import { serve, type ServerType } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { compress } from "hono/compress";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PORT } from "./config.ts";
import { createCoreApp } from "./core.ts";

const app = createCoreApp();

// Compression for Node.js production server
app.use("*", compress());

/**
 * Client SPA serving for Node.js production, Bare-Metal, and Docker
 */
const OUTDIR = join("dist", "client");
const indexPath = join(OUTDIR, "index.html");
if (existsSync(indexPath)) {
  app.use("*", serveStatic({ root: OUTDIR }));
  app.get("*", (c) => c.html(readFileSync(indexPath, "utf-8")));
}

export default app;

/**
 * Server startup for Node.js
 */
let server: ServerType | undefined;

if (process.env.NODE_ENV !== "test") {
  server = serve(
    {
      fetch: app.fetch,
      port: PORT,
    },
    () => {
      const timestamp = new Date().toLocaleTimeString("en-US");
      console.info(
        `${timestamp} [hono] Server Ready on http://localhost:${PORT.toString()}`,
      );
    },
  );
}

const gracefulShutdown = () => {
  setTimeout(() => {
    process.exit(0);
  }, 1000).unref();

  if (server) {
    if (
      "closeAllConnections" in server &&
      typeof server.closeAllConnections === "function"
    ) {
      server.closeAllConnections();
    }
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
