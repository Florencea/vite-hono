import { expect, test } from "vitest";
import type {
  AuthenticatedRouteMarker,
  PermissionGuardedMiddleware,
  PublicRouteMarker,
} from "../../src/server/middleware/permission.ts";
import { apiRouter } from "../../src/server/router.ts";

type GuardedHandler = Record<string, unknown> &
  Partial<
    PermissionGuardedMiddleware & PublicRouteMarker & AuthenticatedRouteMarker
  >;

test("Canary Security Audit Contract: Every API route must have explicit RBAC, authentication, or public declaration", () => {
  // Map of `${method} ${path}` -> array of handlers/middlewares
  const routeMap = new Map<string, GuardedHandler[]>();

  for (const route of apiRouter.routes) {
    const key = `${route.method.toUpperCase()} ${route.path}`;
    const list = routeMap.get(key) ?? [];
    list.push(route.handler as unknown as GuardedHandler);
    routeMap.set(key, list);
  }

  const unguardedRoutes: string[] = [];

  for (const [routeKey, handlers] of routeMap.entries()) {
    const isPublic = handlers.some((h) => Boolean(h.isPublic));
    const isAuthenticated = handlers.some((h) => Boolean(h.isAuthenticated));
    const hasRequiredPermissions = handlers.some(
      (h) =>
        Array.isArray(h.requiredPermissions) &&
        h.requiredPermissions.length > 0,
    );

    if (!isPublic && !isAuthenticated && !hasRequiredPermissions) {
      unguardedRoutes.push(routeKey);
    }
  }

  expect(
    unguardedRoutes,
    `The following API routes are missing access control guards (must have requirePermission, authenticatedRoute, or publicRoute): ${unguardedRoutes.join(", ")}`,
  ).toEqual([]);
});
