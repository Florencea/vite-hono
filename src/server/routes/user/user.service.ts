import { asc, eq } from "drizzle-orm";
import { hashPassword } from "../../auth.ts";
import {
  buildDataScopeCondition,
  type ScopeUser,
} from "../../common/data-scope.ts";
import type { Database } from "../../database/index.ts";
import { userRoles, users } from "../../database/schema.ts";
import type {
  CreateUserReqSchema,
  UpdateUserReqSchema,
} from "./user.schema.ts";
import type { z } from "@hono/zod-openapi";

type CreateInput = z.infer<typeof CreateUserReqSchema>;
type UpdateInput = z.infer<typeof UpdateUserReqSchema>;

export async function getUserList(db: Database, currentUser: ScopeUser) {
  const scopeCondition = await buildDataScopeCondition(db, currentUser, {
    userCol: users.id,
    deptCol: users.departmentId,
  });

  const allUsers = scopeCondition
    ? await db.select().from(users).where(scopeCondition).orderBy(asc(users.id))
    : await db.select().from(users).orderBy(asc(users.id));

  const items = [];
  for (const u of allUsers) {
    const rolesRows = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, u.id));

    items.push({
      ...u,
      roleIds: rolesRows.map((r) => r.roleId),
    });
  }

  return items;
}

export async function createUser(db: Database, input: CreateInput) {
  const existing = await db.query.users.findFirst({
    where: { account: input.account },
  });
  if (existing) {
    return { success: false as const, reason: "account_exists" as const };
  }

  const hashedPassword = await hashPassword(input.password);
  const inserted = await db
    .insert(users)
    .values({
      account: input.account,
      password: hashedPassword,
      name: input.name ?? null,
      employeeNo: input.employeeNo ?? null,
      title: input.title ?? null,
      status: input.status,
      departmentId: input.departmentId ?? null,
      reportsToId: input.reportsToId ?? null,
    })
    .returning();

  const user = inserted[0];

  if (input.roleIds.length > 0) {
    for (const rid of input.roleIds) {
      await db.insert(userRoles).values({
        userId: user.id,
        roleId: rid,
      });
    }
  }

  return {
    success: true as const,
    user: {
      ...user,
      roleIds: input.roleIds,
    },
  };
}

export async function updateUser(db: Database, id: number, input: UpdateInput) {
  const existing = await db.query.users.findFirst({
    where: { id },
  });
  if (!existing) {
    return { success: false as const, reason: "not_found" as const };
  }

  const newPassword = input.password
    ? await hashPassword(input.password)
    : existing.password;

  await db
    .update(users)
    .set({
      password: newPassword,
      name: input.name !== undefined ? input.name : existing.name,
      employeeNo:
        input.employeeNo !== undefined ? input.employeeNo : existing.employeeNo,
      title: input.title !== undefined ? input.title : existing.title,
      status: input.status ?? existing.status,
      departmentId:
        input.departmentId !== undefined
          ? input.departmentId
          : existing.departmentId,
      reportsToId:
        input.reportsToId !== undefined
          ? input.reportsToId
          : existing.reportsToId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));

  if (input.roleIds !== undefined) {
    await db.delete(userRoles).where(eq(userRoles.userId, id));
    for (const rid of input.roleIds) {
      await db.insert(userRoles).values({
        userId: id,
        roleId: rid,
      });
    }
  }

  const updatedUser = await db.query.users.findFirst({
    where: { id },
  });

  if (!updatedUser) {
    throw new Error("Failed to load updated user");
  }

  const rolesRows = await db
    .select({ roleId: userRoles.roleId })
    .from(userRoles)
    .where(eq(userRoles.userId, id));

  return {
    success: true as const,
    user: {
      ...updatedUser,
      roleIds: rolesRows.map((r) => r.roleId),
    },
  };
}

export async function deleteUser(db: Database, id: number) {
  const existing = await db.query.users.findFirst({
    where: { id },
  });
  if (!existing) {
    return { success: false as const, reason: "not_found" as const };
  }
  if (existing.account === "admin" || existing.isSystem) {
    return {
      success: false as const,
      reason: "system_user_protected" as const,
    };
  }

  await db.delete(users).where(eq(users.id, id));
  return { success: true as const };
}
