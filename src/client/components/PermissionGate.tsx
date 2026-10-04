import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { useAccess } from "../hooks/useAccess.ts";

export interface PermissionGateProps {
  permission: string | string[];
  mode?: "hide" | "disable";
  fallback?: ReactNode;
  children: ReactNode;
}

function isDisableableElement(element: ReactNode): element is ReactElement<{ disabled?: boolean }> {
  return isValidElement(element);
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

  if (mode === "disable" && isDisableableElement(children)) {
    return cloneElement(children, {
      disabled: true,
    });
  }

  return <>{fallback}</>;
}

export { PermissionButton } from "./PermissionButton.tsx";
