import { describe, expect, test } from "vitest";
import { getCookieSecret } from "../../src/server/auth.ts";
import { validateConfig } from "../../src/server/config.ts";

describe("Server Config Zero-Config Contract", () => {
  test("validateConfig succeeds with zero environment variables and applies safe defaults", () => {
    const config = validateConfig({});

    expect(config.DATABASE_URL).toBe("file:./database.sqlite");
    expect(config.COOKIE_SECRET).toBe(
      "dev-insecure-cookie-secret-min-32-chars-long",
    );
    expect(config.PORT).toBe(3000);
    expect(config.CORS_ORIGIN).toBe("*");
    expect(config.ENABLE_OPENAPI).toBe(true);
  });

  test("validateConfig allows custom environment overrides", () => {
    const config = validateConfig({
      DATABASE_URL: "file:./custom.sqlite",
      COOKIE_SECRET: "custom-secret-that-is-at-least-32-chars-long",
      PORT: "8080",
      CORS_ORIGIN: "https://example.com",
      ENABLE_OPENAPI: "0",
    });

    expect(config.DATABASE_URL).toBe("file:./custom.sqlite");
    expect(config.COOKIE_SECRET).toBe(
      "custom-secret-that-is-at-least-32-chars-long",
    );
    expect(config.PORT).toBe(8080);
    expect(config.CORS_ORIGIN).toBe("https://example.com");
    expect(config.ENABLE_OPENAPI).toBe(false);
  });

  test("validateConfig aborts when PORT is not a valid number", () => {
    expect(() =>
      validateConfig({
        PORT: "invalid-port",
      }),
    ).toThrow(/Invalid PORT: "invalid-port"/);

    expect(() =>
      validateConfig({
        PORT: "0",
      }),
    ).toThrow(/Invalid PORT: "0"/);

    expect(() =>
      validateConfig({
        PORT: "70000",
      }),
    ).toThrow(/Invalid PORT: "70000"/);
  });

  test("validateConfig aborts in production when COOKIE_SECRET is explicitly provided but shorter than 32 characters", () => {
    expect(() =>
      validateConfig({
        NODE_ENV: "production",
        COOKIE_SECRET: "too-short",
      }),
    ).toThrow(/COOKIE_SECRET must be at least 32 characters/);
  });

  test("getCookieSecret returns a secure 32+ char secret and persists identically", async () => {
    const secret1 = await getCookieSecret();
    expect(typeof secret1).toBe("string");
    expect(secret1.length).toBeGreaterThanOrEqual(32);

    const secret2 = await getCookieSecret();
    expect(secret2).toBe(secret1);
  });
});
