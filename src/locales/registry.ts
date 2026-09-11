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

export type SupportedLocale = keyof typeof SUPPORTED_LOCALES;

export const SUPPORTED_LOCALE_KEYS = Object.keys(
  SUPPORTED_LOCALES,
) as SupportedLocale[];

export const DEFAULT_LOCALE: SupportedLocale = "en-US";

export const dictionaries: Record<SupportedLocale, LocaleSchema> = {
  "en-US": enUS,
  "zh-TW": zhTW,
};
