import { expect, test } from "vite-plus/test";
import { apiRouter } from "../../src/server/router.ts";

function isRecordOrFunction(val: unknown): val is Record<string, unknown> {
  return (typeof val === "function" || typeof val === "object") && val !== null;
}

function isPublicHandler(h: unknown): boolean {
  return isRecordOrFunction(h) && Boolean(h["isPublic"]);
}

function isAuthenticatedHandler(h: unknown): boolean {
  return isRecordOrFunction(h) && Boolean(h["isAuthenticated"]);
}

function hasPermissionHandler(h: unknown): boolean {
  if (isRecordOrFunction(h)) {
    const perms = h["requiredPermissions"];
    return Array.isArray(perms) && perms.length > 0;
  }
  return false;
}

test("Canary Security Audit Contract: Every API route must have explicit RBAC, authentication, or public declaration", () => {
  // Map of `${method} ${path}` -> array of handlers/middlewares
  const routeMap = new Map<string, unknown[]>();

  for (const route of apiRouter.routes) {
    const key = `${route.method.toUpperCase()} ${route.path}`;
    const list = routeMap.get(key) ?? [];
    list.push(route.handler);
    routeMap.set(key, list);
  }

  const unguardedRoutes: string[] = [];

  for (const [routeKey, handlers] of routeMap.entries()) {
    const isPublic = handlers.some(isPublicHandler);
    const isAuthenticated = handlers.some(isAuthenticatedHandler);
    const hasRequiredPermissions = handlers.some(hasPermissionHandler);

    if (!isPublic && !isAuthenticated && !hasRequiredPermissions) {
      unguardedRoutes.push(routeKey);
    }
  }

  expect(
    unguardedRoutes,
    `The following API routes are missing access control guards (must have requirePermission, authenticatedRoute, or publicRoute): ${unguardedRoutes.join(", ")}`,
  ).toEqual([]);
});
