import { eq, inArray, like, or, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import type { Database } from "../database/index.ts";
import { departments, roleDepartments, userRoles } from "../database/schema.ts";
import type { DataScopeType } from "../database/schema.ts";

export interface ScopeUser {
  id: number;
  departmentId: number | null;
  dataScopes: DataScopeType[];
}

export interface ScopeColumns {
  userCol: SQLiteColumn;
  deptCol?: SQLiteColumn;
}

/**
 * Builds a Drizzle SQL condition enforcing data scope constraints:
 * - ALL: No condition (access all records)
 * - DEPT_AND_CHILD: Current department and all descendant departments via materialized path
 * - DEPT: Current department only
 * - SELF: Current user only
 * - CUSTOM: Specific departments assigned to role
 */
export async function buildDataScopeCondition(
  db: Database,
  user: ScopeUser,
  columns: ScopeColumns,
): Promise<SQL | undefined> {
  // If user has 'ALL' in any role, no row-level restriction is applied
  if (user.dataScopes.includes("ALL")) {
    return undefined;
  }

  const scopeConditions = await Promise.all(
    user.dataScopes.map(async (scope) => {
      switch (scope) {
        case "SELF":
          return [eq(columns.userCol, user.id)];

        case "DEPT":
          if (columns.deptCol !== undefined && user.departmentId !== null) {
            return [eq(columns.deptCol, user.departmentId)];
          }
          return [eq(columns.userCol, user.id)];

        case "DEPT_AND_CHILD":
          if (columns.deptCol !== undefined && user.departmentId !== null) {
            const currentDept = await db.query.departments.findFirst({
              where: { id: user.departmentId },
            });
            if (currentDept?.path) {
              const descendantDepts = await db
                .select({ id: departments.id })
                .from(departments)
                .where(like(departments.path, `${currentDept.path}%`));
              const deptIds = descendantDepts.map((d) => d.id);
              if (deptIds.length > 0) {
                return [inArray(columns.deptCol, deptIds)];
              }
            }
          } else {
            return [eq(columns.userCol, user.id)];
          }
          return [];

        case "CUSTOM":
          if (columns.deptCol !== undefined) {
            // Query custom departments linked to the user's roles
            const uRoles = await db
              .select({ roleId: userRoles.roleId })
              .from(userRoles)
              .where(eq(userRoles.userId, user.id));
            const roleIds = uRoles.map((r) => r.roleId);

            if (roleIds.length > 0) {
              const customDepts = await db
                .select({ departmentId: roleDepartments.departmentId })
                .from(roleDepartments)
                .where(inArray(roleDepartments.roleId, roleIds));
              const deptIds = customDepts.map((d) => d.departmentId);
              if (deptIds.length > 0) {
                return [inArray(columns.deptCol, deptIds)];
              }
            }
          }
          return [];

        default:
          return [];
      }
    }),
  );

  const conditions: SQL[] = scopeConditions.flat();

  if (conditions.length === 0) {
    return eq(columns.userCol, user.id);
  }

  return conditions.length === 1 ? conditions[0] : or(...conditions);
}
