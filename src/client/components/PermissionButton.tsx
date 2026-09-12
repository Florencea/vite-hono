import { Button, type ButtonProps } from "antd";
import { useAccess } from "../hooks/useAccess.ts";

export interface PermissionButtonProps extends ButtonProps {
  permission: string | string[];
  permissionMode?: "hide" | "disable";
}

/**
 * Highly ergonomic button seamlessly integrated with RBAC permission gate.
 * Displays, disables, or completely hides the button based on the user's active permissions.
 */
export function PermissionButton({
  permission,
  permissionMode = "hide",
  disabled,
  ...props
}: PermissionButtonProps) {
  const { hasPermission } = useAccess();
  const allowed = hasPermission(permission);

  if (!allowed) {
    if (permissionMode === "disable") {
      return <Button {...props} disabled />;
    }
    return null;
  }

  return <Button {...props} disabled={disabled} />;
}
