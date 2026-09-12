import { useQuery } from "@tanstack/react-query";
import { userInfoQueryOptions } from "../routes/__root.tsx";

export function useAccess() {
  const { data } = useQuery(userInfoQueryOptions());

  const isLogin = Boolean(data?.success);
  const roles = data?.roles ?? [];
  const permissions = data?.permissions ?? [];
  const dataScopes = data?.dataScopes ?? [];
  const isSuperAdmin = roles.includes("super_admin");

  const hasPermission = (permission: string | string[]): boolean => {
    if (!isLogin) return false;
    if (isSuperAdmin) return true;

    if (Array.isArray(permission)) {
      return permission.every((p) => permissions.includes(p));
    }
    return permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!isLogin) return false;
    if (isSuperAdmin) return true;
    return roles.includes(role);
  };

  return {
    isLogin,
    user: data,
    roles,
    permissions,
    dataScopes,
    isSuperAdmin,
    hasPermission,
    hasRole,
  };
}
