import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getTranslation } from "../../locales/core.ts";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "../../locales/registry.ts";
import type {
  TranslationKey,
  TranslationParams,
} from "../../locales/schema.ts";
import {
  detectInitialLocale,
  I18nContext,
  STORAGE_KEY,
} from "../libs/useI18n.ts";

export interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: SupportedLocale;
}

export const I18nProvider = ({
  children,
  initialLocale,
}: I18nProviderProps) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(
    () => initialLocale ?? detectInitialLocale(),
  );

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
      dayjs.locale(SUPPORTED_LOCALES[newLocale].dayjs);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = locale;
      dayjs.locale(SUPPORTED_LOCALES[locale].dayjs);
    }
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey | (string & {}), params?: TranslationParams) => {
      const dict = SUPPORTED_LOCALES[locale].dict;
      return getTranslation(dict, key, params);
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      supportedLocales: SUPPORTED_LOCALES,
    }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
