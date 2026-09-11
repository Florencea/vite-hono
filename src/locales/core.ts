import type { LocaleSchema, TranslationParams } from "./schema.ts";

/**
 * Pure translation lookup function shared across client and server.
 * Supports dot-separated keys (e.g. 'common.logout'), route paths (e.g. '/user'),
 * and {variable} parameter interpolation.
 */
export function getTranslation(
  dict: LocaleSchema,
  path: string,
  params?: TranslationParams,
): string {
  if (path.startsWith("/") && path in dict.routes) {
    return dict.routes[path as keyof typeof dict.routes];
  }

  const keys = path.split(".");
  let current: unknown = dict;

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      current = undefined;
      break;
    }
  }

  if (typeof current !== "string") {
    return path;
  }

  if (!params) {
    return current;
  }

  return current.replace(/\{\s*(\w+)\s*\}/g, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      return String(params[key]);
    }
    return match;
  });
}
