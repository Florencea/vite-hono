import { eq, inArray } from "drizzle-orm";
import { verifyPassword } from "../../auth.ts";
import type { AuthUserDetail } from "../../context.ts";
import type { Database } from "../../database/index.ts";
import {
  permissions,
  rolePermissions,
  roles,
  userRoles,
} from "../../database/schema.ts";

export type AuthenticateResult =
  | { success: true; user: { id: number; account: string } }
  | { success: false; reason: "user_not_found" | "wrong_password" };

export async function authenticateUser(
  db: Database,
  account: string,
  password: string,
): Promise<AuthenticateResult> {
  const user = await db.query.users.findFirst({
    where: { account },
  });

  if (!user) {
    return { success: false, reason: "user_not_found" };
  }

  const match = await verifyPassword(user.password, password);
  if (!match) {
    return { success: false, reason: "wrong_password" };
  }

  return {
    success: true,
    user: {
      id: user.id,
      account: user.account,
    },
  };
}

export async function getAuthUserDetail(
  db: Database,
  userId: number,
): Promise<AuthUserDetail | null> {
  const user = await db.query.users.findFirst({
    where: { id: userId },
  });
  if (!user) return null;

  // Query user's roles
  const uRoleRows = await db
    .select({ roleId: userRoles.roleId })
    .from(userRoles)
    .where(eq(userRoles.userId, userId));
  const roleIds = uRoleRows.map((r) => r.roleId);

  const rolesList =
    roleIds.length > 0
      ? await db.select().from(roles).where(inArray(roles.id, roleIds))
      : [];
  const roleCodes = rolesList.map((r) => r.code);

  let permissionCodes: string[] = [];
  let dataScopes = rolesList.map((r) => r.dataScope);

  if (roleCodes.includes("super_admin")) {
    const allPerms = await db
      .select({ code: permissions.code })
      .from(permissions);
    permissionCodes = allPerms.map((p) => p.code);
    dataScopes = ["ALL"];
  } else if (roleIds.length > 0) {
    const rPermRows = await db
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(inArray(rolePermissions.roleId, roleIds));
    const permIds = rPermRows.map((rp) => rp.permissionId);

    if (permIds.length > 0) {
      const permsList = await db
        .select({ code: permissions.code })
        .from(permissions)
        .where(inArray(permissions.id, permIds));
      permissionCodes = Array.from(new Set(permsList.map((p) => p.code)));
    }
  }

  return {
    id: user.id,
    account: user.account,
    name: user.name ?? null,
    employeeNo: user.employeeNo ?? null,
    title: user.title ?? null,
    departmentId: user.departmentId ?? null,
    roles: roleCodes,
    permissions: permissionCodes,
    dataScopes,
  };
}
