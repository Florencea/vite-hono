import type { Context, MiddlewareHandler } from "hono";
import { languageDetector } from "hono/language";
import { getTranslation } from "../locales/core.ts";
import {
  DEFAULT_LOCALE,
  dictionaries,
  SUPPORTED_LOCALE_KEYS,
  type SupportedLocale,
} from "../locales/registry.ts";
import type { TranslationKey, TranslationParams } from "../locales/schema.ts";

export const i18nMiddleware: MiddlewareHandler = languageDetector({
  order: ["header", "querystring", "cookie"],
  caches: false,
  supportedLanguages: [...SUPPORTED_LOCALE_KEYS],
  fallbackLanguage: DEFAULT_LOCALE,
  convertDetectedLanguage: (lang) => {
    if (lang.toLowerCase().startsWith("zh")) return "zh-TW";
    if (lang.toLowerCase().startsWith("en")) return "en-US";
    return lang;
  },
});

export function t(
  c: Context,
  path: TranslationKey | (string & {}),
  params?: TranslationParams,
): string {
  const lang = c.get("language") as string | undefined;
  const currentLang = (
    lang && lang in dictionaries ? lang : DEFAULT_LOCALE
  ) as SupportedLocale;
  const dict = dictionaries[currentLang];
  return getTranslation(dict, path, params);
}
