import type { Locale } from "antd/es/locale";
import antdEnUS from "antd/es/locale/en_US";
import antdZhTW from "antd/es/locale/zh_TW";
import { createContext, use } from "react";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "../../locales/registry.ts";
import type {
  TranslationKey,
  TranslationParams,
} from "../../locales/schema.ts";

export const antdLocales: Record<SupportedLocale, Locale> = {
  "en-US": antdEnUS,
  "zh-TW": antdZhTW,
};

export const STORAGE_KEY = "app_lang";

export function detectInitialLocale(): SupportedLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in SUPPORTED_LOCALES) {
    return stored as SupportedLocale;
  }

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("zh")) {
    return "zh-TW";
  }

  return DEFAULT_LOCALE;
}

export interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (
    key: TranslationKey | (string & {}),
    params?: TranslationParams,
  ) => string;
  supportedLocales: typeof SUPPORTED_LOCALES;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export const useI18n = (): I18nContextValue => {
  const ctx = use(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
};
