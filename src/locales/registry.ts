import enUS from "./en-US.ts";
import type { LocaleSchema } from "./schema.ts";
import zhTW from "./zh-TW.ts";

export interface LocaleMeta {
  name: string;
  dict: LocaleSchema;
  dayjs: string;
}

export const SUPPORTED_LOCALES = {
  "en-US": {
    name: "English",
    dict: enUS,
    dayjs: "en",
  },
  "zh-TW": {
    name: "繁體中文",
    dict: zhTW,
    dayjs: "zh-tw",
  },
} as const satisfies Record<string, LocaleMeta>;

export const SUPPORTED_LOCALE_KEYS = ["en-US", "zh-TW"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALE_KEYS)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en-US";

export const dictionaries: Record<SupportedLocale, LocaleSchema> = {
  "en-US": enUS,
  "zh-TW": zhTW,
};

export function isSupportedLocale(key: unknown): key is SupportedLocale {
  return typeof key === "string" && Object.prototype.hasOwnProperty.call(dictionaries, key);
}
