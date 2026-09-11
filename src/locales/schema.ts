/**
 * Single Source of Truth (SSOT) for the application's translation dictionary structure.
 * Every supported language must implement `satisfies LocaleSchema`.
 */
export interface LocaleSchema {
  common: {
    title: string;
    logout: string;
    submit: string;
    changeLanguage: string;
  };
  auth: {
    login: string;
    account: string;
    password: string;
  };
  routes: {
    "/": string;
    "/login": string;
    "/user": string;
  };
  errors: {
    auth: {
      userNotFound: string;
      wrongPassword: string;
      unauthorized: string;
      forbidden: string;
    };
    common: {
      notFound: string;
      internalServerError: string;
      invalidRequest: string;
    };
  };
}

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never;

type Leaves<T> = T extends object
  ? { [K in keyof T]-?: Join<K, Leaves<T[K]>> }[keyof T]
  : "";

/**
 * Union of all valid dot-separated key paths in `LocaleSchema`.
 * Provides full autocompletion and compile-time key validation.
 */
export type TranslationKey = Leaves<LocaleSchema>;

export type TranslationParams = Record<string, string | number>;
