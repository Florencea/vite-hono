import "dotenv/config";

import { join, posix } from "node:path";
import { exit } from "node:process";

export interface SwaggerUiCustomOptions {
  customCssUrl?: string[];
  customJs?: string[];
  swaggerOptions?: Record<string, unknown>;
  customSiteTitle?: string;
  customfavIcon?: string;
}

const getEnv = ({
  env,
  from = ".env",
  field = env,
  defaultValue,
}: {
  env: string;
  from?: string;
  field?: string;
  defaultValue?: string;
}) => {
  const ENV = process.env[env] ?? defaultValue;
  if (ENV === undefined) {
    const errorMsg = `No \`${field}\` field found in \`${from}\`, exit`;
    console.error(errorMsg);
    exit(1);
  } else {
    return ENV;
  }
};

const getEnvFlag = ({
  env,
  from = ".env",
  field = env,
  defaultValue = "0",
}: {
  env: string;
  from?: string;
  field?: string;
  defaultValue?: string;
}) => {
  const ENV = getEnv({ env, from, field, defaultValue });
  if (ENV === "1" || ENV === "true") {
    return true;
  } else if (ENV === "0" || ENV === "false") {
    return false;
  } else {
    const errorMsg = `Flag \`${field}\` must be \`1\` or \`0\` in \`${from}\`, exit`;
    console.error(errorMsg);
    exit(1);
  }
};

/**
 * Enable client SPA serving
 */
export const ENABLE_CLIENT = getEnvFlag({
  env: "ENABLE_CLIENT",
  defaultValue: "1",
});

/**
 * Enable server API
 */
export const ENABLE_SERVER = getEnvFlag({
  env: "ENABLE_SERVER",
  defaultValue: "1",
});

/**
 * Enable openapi doc & swagger ui
 */
export const ENABLE_OPENAPI =
  (process.env.ENABLE_OPENAPI ?? "1") === "1" || process.env.ENABLE_OPENAPI === "true";

/**
 * Enable typegen endpoint
 */
export const ENABLE_TYPEGEN = getEnvFlag({
  env: "ENABLE_TYPEGEN",
  defaultValue: "1",
});

/**
 * Enable HTTP compression
 */
export const ENABLE_COMPRESSION = getEnvFlag({
  env: "ENABLE_COMPRESSION",
  defaultValue: "1",
});

/**
 * Server in production mode
 */
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * API version
 */
export const VERSION = getEnv({
  env: "npm_package_version",
  from: "package.json",
  field: "version",
  defaultValue: "1.0.0",
});

/**
 * Server port to listen (Node / Docker)
 */
export const PORT = parseInt(getEnv({ env: "PORT", defaultValue: "3000" }), 10);

/**
 * Server web base URL path
 */
export const BASE = getEnv({ env: "VITE_WEB_BASE", defaultValue: "/" });

/**
 * Client output directory
 */
export const OUTDIR = join(getEnv({ env: "VITE_OUTDIR", defaultValue: "dist" }), "client");

/**
 * Hono RPC API endpoint route prefix
 */
export const API_ENDPOINT_RPC = getEnv({
  env: "VITE_API_ENDPOINT_RPC",
  defaultValue: "/api",
});

/**
 * CORS allowed origin
 */
export const CORS_ORIGIN = getEnv({ env: "CORS_ORIGIN", defaultValue: "*" });

/**
 * Session cookie name
 */
export const COOKIE_NAME = getEnv({
  env: "COOKIE_NAME",
  defaultValue: "TestViteHono",
});

/**
 * Session secret key (used by hono/jwt)
 */
export const COOKIE_SECRET = getEnv({
  env: "COOKIE_SECRET",
  defaultValue: "a long secret at least 32 characters long",
});

/**
 * Session TTL in seconds (default 7 days)
 */
export const SESSION_TTL = parseInt(getEnv({ env: "SESSION_TTL", defaultValue: "604800" }), 10);

/**
 * Database connection URL
 */
export const DATABASE_URL = getEnv({
  env: "DATABASE_URL",
  defaultValue: "file:./database.sqlite",
});

/**
 * OpenAPI doc title
 */
export const DOC_TITLE = [
  getEnv({ env: "VITE_TITLE", defaultValue: "Test Vite Hono" }),
  "OpenAPI",
].join(" ");

/**
 * OpenAPI doc route
 */
export const DOC_ROUTE = posix.join(
  BASE,
  getEnv({ env: "VITE_API_OPENAPI_DOC_ROUTE", defaultValue: "/openapi" }),
);

/**
 * OpenAPI typegen route
 */
export const DOC_TYPEGEN_ROUTE = posix.join(DOC_ROUTE, "typegen");

/**
 * OpenAPI config
 */
export const SWAGGER_UI_OPTIONS: SwaggerUiCustomOptions = {
  swaggerOptions: {
    docExpansion: "list",
    persistAuthorization: true,
    deepLinking: true,
    displayRequestDuration: true,
    defaultModelRendering: "example",
    defaultModelExpandDepth: 9999,
    tagsSorter: "alpha",
    filter: true,
    withCredentials: true,
    syntaxHighlight: false,
    requestSnippetsEnabled: false,
  },
  customSiteTitle: DOC_TITLE,
  customfavIcon: "favicon.ico",
};

const timestamp = new Date().toLocaleTimeString("en-US");
const serverUrl = IS_PRODUCTION
  ? `port: ${PORT}, base: ${BASE}`
  : `http://localhost:${PORT}${BASE}`;

/**
 * Server ready message
 */
export const SERVER_READY_MESSAGE = `${timestamp} [hono] Server Ready on ${serverUrl}`;
