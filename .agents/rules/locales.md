---
trigger: glob
globs: "src/locales/**"
description: i18n translation parity, LocaleSchema SSOT, and isomorphic localization contracts.
---

# Internationalization & Localization Guidelines

Guidelines for maintaining zero key drift and strict language parity.

## 1. Schema Single Source of Truth

- **Pure TypeScript Schema**: `src/locales/schema.ts` defines `LocaleSchema` and `TranslationKey`.
- **Strict Language Parity**: Every supported dictionary (`en-US.ts`, `zh-TW.ts`) MUST implement `satisfies LocaleSchema`.
- **Zero Key Drift Contract**: Asserted recursively via `test/canary/i18n-contract.test.ts`.

## 2. Isomorphic Localization API

- **Client**: Consume translations via `useI18n()` (`useTranslation`) with type-safe autocompleted keys.
- **Server**: Dynamically resolve translations according to `Accept-Language` headers via `t(c, key)` from `src/server/i18n.ts`.
