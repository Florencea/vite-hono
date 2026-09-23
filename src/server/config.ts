export interface ServerConfig {
  DATABASE_URL: string;
  COOKIE_SECRET: string;
  PORT: number;
  CORS_ORIGIN: string;
  ENABLE_OPENAPI: boolean;
}

/**
 * Resolves server configuration with zero-config sensible defaults.
 * Optional environment variables can override defaults.
 */
export function validateConfig(
  env: Record<string, string | undefined> = process.env,
): ServerConfig {
  const databaseUrl = env.DATABASE_URL?.trim() ?? "file:./database.sqlite";

  const rawCookieSecret = env.COOKIE_SECRET?.trim();
  if (
    env.NODE_ENV === "production" &&
    rawCookieSecret &&
    rawCookieSecret.length < 32
  ) {
    throw new Error(
      `[Config Error] COOKIE_SECRET must be at least 32 characters long in production for security.`,
    );
  }
  const cookieSecret =
    rawCookieSecret ?? "dev-insecure-cookie-secret-min-32-chars-long";

  let port = 3000;
  const portStr = env.PORT?.trim();
  if (portStr) {
    const parsedPort = Number.parseInt(portStr, 10);
    if (Number.isNaN(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
      throw new Error(
        `[Config Error] Invalid PORT: "${portStr}". Must be a valid port number between 1 and 65535.`,
      );
    }
    port = parsedPort;
  }

  const corsOrigin = env.CORS_ORIGIN?.trim() ?? "*";

  const enableOpenApiStr = env.ENABLE_OPENAPI?.trim();
  const enableOpenApi =
    enableOpenApiStr !== "0" && enableOpenApiStr !== "false";

  return {
    DATABASE_URL: databaseUrl,
    COOKIE_SECRET: cookieSecret,
    PORT: port,
    CORS_ORIGIN: corsOrigin,
    ENABLE_OPENAPI: enableOpenApi,
  };
}

export const {
  DATABASE_URL,
  COOKIE_SECRET,
  PORT,
  CORS_ORIGIN,
  ENABLE_OPENAPI,
} = validateConfig();
