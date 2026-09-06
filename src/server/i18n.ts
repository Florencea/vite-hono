import type { Context, MiddlewareHandler } from "hono";
import { languageDetector } from "hono/language";
import enUS from "../locales/en-US.ts";
import zhTW from "../locales/zh-TW.ts";

export const SUPPORTED_LANGUAGES = ["en-US", "zh-TW"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = "en-US";

export const resources = {
  "en-US": enUS,
  "zh-TW": zhTW,
} as const;

export const i18nMiddleware: MiddlewareHandler = languageDetector({
  order: ["header", "querystring", "cookie"],
  caches: false,
  supportedLanguages: [...SUPPORTED_LANGUAGES],
  fallbackLanguage: DEFAULT_LANGUAGE,
  convertDetectedLanguage: (lang) => {
    if (lang.toLowerCase().startsWith("zh")) return "zh-TW";
    if (lang.toLowerCase().startsWith("en")) return "en-US";
    return lang;
  },
});

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}` | `${Key}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<typeof enUS>;

export function getTranslation(lang: string | undefined, path: string): string {
  const currentLang = (lang && lang in resources ? lang : DEFAULT_LANGUAGE) as SupportedLanguage;
  const dict = resources[currentLang] || resources[DEFAULT_LANGUAGE];

  const keys = path.split(".");
  let current: unknown = dict;

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return path;
    }
  }

  return typeof current === "string" ? current : path;
}

export function t(c: Context, path: string): string {
  const lang = c.get("language") as string | undefined;
  return getTranslation(lang, path);
}
