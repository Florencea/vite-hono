import type { LocaleSchema, TranslationParams } from "./schema.ts";

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

function isRouteKey(
  routes: LocaleSchema["routes"],
  key: string,
): key is keyof LocaleSchema["routes"] {
  return Object.prototype.hasOwnProperty.call(routes, key);
}

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
  if (path.startsWith("/") && isRouteKey(dict.routes, path)) {
    return dict.routes[path];
  }

  const keys = path.split(".");
  let current: unknown = dict;

  for (const k of keys) {
    if (isRecord(current) && Object.prototype.hasOwnProperty.call(current, k)) {
      current = current[k];
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
