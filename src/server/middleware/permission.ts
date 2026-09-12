import { createMiddleware } from "hono/factory";
import { getSession } from "../auth.ts";
import type { AppEnv } from "../common/factory.ts";
import { getDb } from "../database/index.ts";
import { t } from "../i18n.ts";
import { getAuthUserDetail } from "../routes/auth/auth.service.ts";

export interface PermissionGuardedMiddleware {
  requiredPermissions: string[];
}

export interface PublicRouteMarker {
  isPublic: true;
}

/**
 * Route-level guard enforcing explicit fine-grained RBAC permission codes.
 * Super admin bypasses all code checks. Returns 401 if unauthenticated, 403 if unauthorized.
 */
export function requirePermission(...permissionCodes: string[]) {
  const middleware = createMiddleware<AppEnv>(async (c, next) => {
    const session = await getSession(c);
    if (!session?.id) {
      return c.json({ error: t(c, "errors.auth.unauthorized") }, 401);
    }

    let user = c.get("user");
    if (!user) {
      const db = getDb(c);
      const detail = await getAuthUserDetail(db, session.id);
      if (!detail) {
        return c.json({ error: t(c, "errors.auth.unauthorized") }, 401);
      }
      c.set("user", detail);
      user = detail;
    }

    // Super Admin automatically bypasses all functional permission checks
    if (user.roles.includes("super_admin")) {
      await next();
      return;
    }

    const hasPermission = permissionCodes.every((code) =>
      user.permissions.includes(code),
    );

    if (!hasPermission) {
      return c.json({ error: t(c, "errors.auth.forbidden") }, 403);
    }

    await next();
  });

  Object.assign(middleware, { requiredPermissions: permissionCodes });
  return middleware as typeof middleware & PermissionGuardedMiddleware;
}

/**
 * Explicit public route marker for endpoints that bypass RBAC (e.g. login).
 * Audited by Canary contract test to prevent accidental unprotected routes.
 */
export function publicRoute() {
  const middleware = createMiddleware<AppEnv>(async (_c, next) => {
    await next();
  });

  Object.assign(middleware, { isPublic: true as const });
  return middleware as typeof middleware & PublicRouteMarker;
}

export interface AuthenticatedRouteMarker {
  isAuthenticated: true;
}

/**
 * Route marker requiring an active authenticated session without specific permission codes (e.g. logout).
 */
export function authenticatedRoute() {
  const middleware = createMiddleware<AppEnv>(async (c, next) => {
    const session = await getSession(c);
    if (!session?.id) {
      return c.json({ error: t(c, "errors.auth.unauthorized") }, 401);
    }
    await next();
  });

  Object.assign(middleware, { isAuthenticated: true as const });
  return middleware as typeof middleware & AuthenticatedRouteMarker;
}
