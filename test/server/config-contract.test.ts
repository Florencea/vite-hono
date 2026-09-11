import { describe, expect, test } from "vitest";
import { validateConfig } from "../../src/server/config.ts";

const validEnv = {
  DATABASE_URL: "file:./database.sqlite",
  COOKIE_SECRET: "a-secret-that-is-at-least-32-chars-long",
  PORT: "3000",
  CORS_ORIGIN: "*",
  ENABLE_OPENAPI: "1",
};

describe("Server Config Environment Contract", () => {
  test("validateConfig succeeds when all required variables are present", () => {
    const config = validateConfig(validEnv);

    expect(config.DATABASE_URL).toBe("file:./database.sqlite");
    expect(config.COOKIE_SECRET).toBe(
      "a-secret-that-is-at-least-32-chars-long",
    );
    expect(config.PORT).toBe(3000);
    expect(config.CORS_ORIGIN).toBe("*");
    expect(config.ENABLE_OPENAPI).toBe(true);
  });

  test("validateConfig aborts immediately when DATABASE_URL is missing", () => {
    expect(() =>
      validateConfig({ ...validEnv, DATABASE_URL: undefined }),
    ).toThrow(/Missing required environment variable\(s\): DATABASE_URL/);
  });

  test("validateConfig aborts immediately when COOKIE_SECRET is missing", () => {
    expect(() =>
      validateConfig({ ...validEnv, COOKIE_SECRET: undefined }),
    ).toThrow(/Missing required environment variable\(s\): COOKIE_SECRET/);
  });

  test("validateConfig aborts immediately when PORT is missing", () => {
    expect(() => validateConfig({ ...validEnv, PORT: undefined })).toThrow(
      /Missing required environment variable\(s\): PORT/,
    );
  });

  test("validateConfig aborts immediately when CORS_ORIGIN is missing", () => {
    expect(() =>
      validateConfig({ ...validEnv, CORS_ORIGIN: undefined }),
    ).toThrow(/Missing required environment variable\(s\): CORS_ORIGIN/);
  });

  test("validateConfig aborts immediately when ENABLE_OPENAPI is missing", () => {
    expect(() =>
      validateConfig({ ...validEnv, ENABLE_OPENAPI: undefined }),
    ).toThrow(/Missing required environment variable\(s\): ENABLE_OPENAPI/);
  });

  test("validateConfig lists all missing variables when multiple are absent", () => {
    expect(() => validateConfig({})).toThrow(
      /Missing required environment variable\(s\): DATABASE_URL, COOKIE_SECRET, PORT, CORS_ORIGIN, ENABLE_OPENAPI/,
    );
  });

  test("validateConfig aborts when PORT is not a valid number", () => {
    expect(() =>
      validateConfig({
        ...validEnv,
        PORT: "invalid-port",
      }),
    ).toThrow(/Invalid PORT: "invalid-port"/);
  });

  test("validateConfig aborts in production when COOKIE_SECRET is shorter than 32 characters", () => {
    expect(() =>
      validateConfig({
        ...validEnv,
        NODE_ENV: "production",
        COOKIE_SECRET: "too-short",
      }),
    ).toThrow(/COOKIE_SECRET must be at least 32 characters/);
  });
});
