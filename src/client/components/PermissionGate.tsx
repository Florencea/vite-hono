import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { useAccess } from "../hooks/useAccess.ts";

export interface PermissionGateProps {
  permission: string | string[];
  mode?: "hide" | "disable";
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Encapsulated component guard that conditionally displays or disables UI actions based on permissions.
 */
export function PermissionGate({
  permission,
  mode = "hide",
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission } = useAccess();
  const allowed = hasPermission(permission);

  if (allowed) {
    return <>{children}</>;
  }

  if (mode === "disable" && isValidElement(children)) {
    return cloneElement(children as ReactElement<{ disabled?: boolean }>, {
      disabled: true,
    });
  }

  return <>{fallback}</>;
}

export { PermissionButton } from "./PermissionButton.tsx";
