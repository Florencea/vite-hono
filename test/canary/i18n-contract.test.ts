import { describe, expect, expectTypeOf, test } from "vitest";
import { getTranslation } from "../../src/locales/core";
import enUS from "../../src/locales/en-US";
import {
  dictionaries,
  SUPPORTED_LOCALE_KEYS,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "../../src/locales/registry";
import type { LocaleSchema, TranslationKey } from "../../src/locales/schema";
import zhTW from "../../src/locales/zh-TW";
import app from "../../src/server/app";

describe("i18n Schema & Parity Contract", () => {
  test("Static Type Contract: All locales strictly conform to LocaleSchema", () => {
    expectTypeOf(enUS).toExtend<LocaleSchema>();
    expectTypeOf(zhTW).toExtend<LocaleSchema>();
    expectTypeOf<TranslationKey>().toBeString();
  });

  test("Zero Key Drift Contract: Every language matches en-US keys recursively with non-empty values", () => {
    function getAllLeafKeys(
      obj: Record<string, unknown>,
      prefix = "",
    ): string[] {
      const keys: string[] = [];
      for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object") {
          keys.push(...getAllLeafKeys(v as Record<string, unknown>, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys.sort();
    }

    const baseKeys = getAllLeafKeys(enUS);

    for (const locale of SUPPORTED_LOCALE_KEYS) {
      const meta = SUPPORTED_LOCALES[locale];
      const targetKeys = getAllLeafKeys(meta.dict);
      expect(
        targetKeys,
        `Locale '${locale}' must have identical keys to base locale en-US`,
      ).toEqual(baseKeys);

      // Verify no empty or whitespace-only translation strings
      for (const key of targetKeys) {
        const translation = getTranslation(meta.dict, key);
        expect(
          translation.trim().length,
          `Translation for key '${key}' in locale '${locale}' cannot be empty`,
        ).toBeGreaterThan(0);
      }
    }
  });

  test("Parameter Interpolation: Replaces {variable} tokens correctly", () => {
    const mockDict: LocaleSchema = {
      ...enUS,
      common: {
        ...enUS.common,
        submit: "Submit {name}!",
      },
    };
    const rendered = getTranslation(mockDict, "common.submit", {
      name: "Antigravity",
    });
    expect(rendered).toBe("Submit Antigravity!");
  });
});

describe("Server i18n HTTP & Error Contract", () => {
  test("POST /api/auth/logout returns localized 401 based on Accept-Language", async () => {
    // English request
    const enRes = await app.request("/api/auth/logout", {
      method: "POST",
      headers: { "Accept-Language": "en-US,en;q=0.9" },
    });
    expect(enRes.status).toBe(401);
    const enJson = (await enRes.json()) as { error: string };
    expect(enJson.error).toBe(enUS.errors.auth.unauthorized);

    // Traditional Chinese request
    const zhRes = await app.request("/api/auth/logout", {
      method: "POST",
      headers: { "Accept-Language": "zh-TW,zh;q=0.9" },
    });
    expect(zhRes.status).toBe(401);
    const zhJson = (await zhRes.json()) as { error: string };
    expect(zhJson.error).toBe(zhTW.errors.auth.unauthorized);
  });

  test("POST /api/auth/login returns localized 400 error for non-existent account", async () => {
    const zhRes = await app.request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "zh-TW",
      },
      body: JSON.stringify({
        account: "non_existent_user",
        password: "random_password",
      }),
    });
    expect(zhRes.status).toBe(400);
    const zhJson = (await zhRes.json()) as { error: string };
    expect(zhJson.error).toBe(zhTW.errors.auth.userNotFound);

    const enRes = await app.request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "en-US",
      },
      body: JSON.stringify({
        account: "non_existent_user",
        password: "random_password",
      }),
    });
    expect(enRes.status).toBe(400);
    const enJson = (await enRes.json()) as { error: string };
    expect(enJson.error).toBe(enUS.errors.auth.userNotFound);
  });

  test("GET /api/* unhandled routes return localized 404 error", async () => {
    const zhRes = await app.request("/api/unhandled_random_route", {
      method: "GET",
      headers: { "Accept-Language": "zh-TW" },
    });
    expect(zhRes.status).toBe(404);
    const zhJson = (await zhRes.json()) as { error: string };
    expect(zhJson.error).toBe(zhTW.errors.common.notFound);

    const enRes = await app.request("/api/unhandled_random_route", {
      method: "GET",
      headers: { "Accept-Language": "en-US" },
    });
    expect(enRes.status).toBe(404);
    const enJson = (await enRes.json()) as { error: string };
    expect(enJson.error).toBe(enUS.errors.common.notFound);
  });

  test("Registry dictionaries map all supported locales", () => {
    const supportedKeys = Object.keys(SUPPORTED_LOCALES) as SupportedLocale[];
    for (const key of supportedKeys) {
      expect(dictionaries[key]).toBeDefined();
    }
  });
});
