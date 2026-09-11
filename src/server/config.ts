import "dotenv/config";

export interface ServerConfig {
  DATABASE_URL: string;
  COOKIE_SECRET: string;
  PORT: number;
  CORS_ORIGIN: string;
  ENABLE_OPENAPI: boolean;
}

/**
 * Validates all required environment variables for the server.
 * If any variable is missing or invalid in .env, aborts immediately without applying default values.
 */
export function validateConfig(
  env: Record<string, string | undefined> = process.env,
): ServerConfig {
  const missing: string[] = [];

  const databaseUrl = env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    missing.push("DATABASE_URL");
  }

  const cookieSecret = env.COOKIE_SECRET?.trim();
  if (!cookieSecret) {
    missing.push("COOKIE_SECRET");
  }

  const portStr = env.PORT?.trim();
  if (!portStr) {
    missing.push("PORT");
  }

  const corsOrigin = env.CORS_ORIGIN?.trim();
  if (!corsOrigin) {
    missing.push("CORS_ORIGIN");
  }

  const enableOpenApiStr = env.ENABLE_OPENAPI?.trim();
  if (!enableOpenApiStr) {
    missing.push("ENABLE_OPENAPI");
  }

  if (
    !databaseUrl ||
    !cookieSecret ||
    !portStr ||
    !corsOrigin ||
    !enableOpenApiStr
  ) {
    throw new Error(
      `[Config Error] Missing required environment variable(s): ${missing.join(", ")}.\n` +
        `Please ensure all configuration variables are explicitly defined in your .env file (refer to .env.example).`,
    );
  }

  const port = Number.parseInt(portStr, 10);
  if (Number.isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(
      `[Config Error] Invalid PORT: "${portStr}". Must be a valid port number between 1 and 65535.`,
    );
  }

  if (env.NODE_ENV === "production" && cookieSecret.length < 32) {
    throw new Error(
      `[Config Error] COOKIE_SECRET must be at least 32 characters long in production for security.`,
    );
  }

  return {
    DATABASE_URL: databaseUrl,
    COOKIE_SECRET: cookieSecret,
    PORT: port,
    CORS_ORIGIN: corsOrigin,
    ENABLE_OPENAPI: enableOpenApiStr === "1" || enableOpenApiStr === "true",
  };
}

export const {
  DATABASE_URL,
  COOKIE_SECRET,
  PORT,
  CORS_ORIGIN,
  ENABLE_OPENAPI,
} = validateConfig();
