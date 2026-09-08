import "dotenv/config";

import { join, posix } from "node:path";

/**
 * Server in production mode
 */
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * API version
 */
export const VERSION = process.env.npm_package_version ?? "1.0.0";

/**
 * Server port to listen (Node / Docker)
 */
export const PORT = parseInt(process.env.PORT ?? "3000", 10);

/**
 * Server web base URL path
 */
export const BASE = process.env.VITE_WEB_BASE ?? "/";

/**
 * Client output directory
 */
export const OUTDIR = join(process.env.VITE_OUTDIR ?? "dist", "client");

/**
 * Hono RPC API endpoint route prefix
 */
export const API_ENDPOINT_RPC = process.env.VITE_API_ENDPOINT_RPC ?? "/api";

/**
 * CORS allowed origin
 */
export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

/**
 * Session cookie name
 */
export const COOKIE_NAME = process.env.COOKIE_NAME ?? "TestViteHono";

/**
 * Session secret key (used by hono/jwt)
 */
export const COOKIE_SECRET =
  process.env.COOKIE_SECRET ?? "a long secret at least 32 characters long";

/**
 * Session TTL in seconds (default 7 days)
 */
export const SESSION_TTL = parseInt(process.env.SESSION_TTL ?? "604800", 10);

/**
 * Database connection URL
 */
export const DATABASE_URL =
  process.env.DATABASE_URL ?? "file:./database.sqlite";

/**
 * OpenAPI doc title
 */
export const DOC_TITLE = [
  process.env.VITE_TITLE ?? "Test Vite Hono",
  "API Reference",
].join(" ");

/**
 * OpenAPI doc route
 */
export const DOC_ROUTE = posix.join(
  BASE,
  process.env.VITE_API_OPENAPI_DOC_ROUTE ?? "/openapi",
);

/**
 * Enable OpenAPI spec and Scalar documentation
 */
export const ENABLE_OPENAPI =
  (process.env.ENABLE_OPENAPI ?? "1") === "1" ||
  process.env.ENABLE_OPENAPI === "true";

const timestamp = new Date().toLocaleTimeString("en-US");
const serverUrl = IS_PRODUCTION
  ? `port: ${PORT.toString()}, base: ${BASE}`
  : `http://localhost:${PORT.toString()}${BASE}`;

/**
 * Server ready message
 */
export const SERVER_READY_MESSAGE = `${timestamp} [hono] Server Ready on ${serverUrl}`;
