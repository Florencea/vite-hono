import { asc, eq } from "drizzle-orm";
import type { Database } from "../../database/index.ts";
import {
  roleDepartments,
  rolePermissions,
  roles,
} from "../../database/schema.ts";
import type {
  CreateRoleReqSchema,
  UpdateRoleReqSchema,
} from "./role.schema.ts";
import type { z } from "@hono/zod-openapi";

type CreateInput = z.infer<typeof CreateRoleReqSchema>;
type UpdateInput = z.infer<typeof UpdateRoleReqSchema>;

export async function getRoleList(db: Database) {
  const allRoles = await db
    .select()
    .from(roles)
    .orderBy(asc(roles.sort), asc(roles.id));

  const items = [];
  for (const r of allRoles) {
    const rPerms = await db
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, r.id));

    const rDepts = await db
      .select({ departmentId: roleDepartments.departmentId })
      .from(roleDepartments)
      .where(eq(roleDepartments.roleId, r.id));

    items.push({
      ...r,
      permissionIds: rPerms.map((p) => p.permissionId),
      departmentIds: rDepts.map((d) => d.departmentId),
    });
  }

  return items;
}

export async function createRole(db: Database, input: CreateInput) {
  const existing = await db.query.roles.findFirst({
    where: { code: input.code },
  });
  if (existing) {
    return { success: false as const, reason: "code_exists" as const };
  }

  const inserted = await db
    .insert(roles)
    .values({
      code: input.code,
      name: input.name,
      description: input.description ?? null,
      dataScope: input.dataScope,
      sort: input.sort,
      isSystem: false,
    })
    .returning();

  const role = inserted[0];

  // Insert assigned permissions
  if (input.permissionIds.length > 0) {
    for (const pid of input.permissionIds) {
      await db.insert(rolePermissions).values({
        roleId: role.id,
        permissionId: pid,
      });
    }
  }

  // Insert assigned departments if dataScope is CUSTOM
  if (input.dataScope === "CUSTOM" && input.departmentIds.length > 0) {
    for (const did of input.departmentIds) {
      await db.insert(roleDepartments).values({
        roleId: role.id,
        departmentId: did,
      });
    }
  }

  return {
    success: true as const,
    role: {
      ...role,
      permissionIds: input.permissionIds,
      departmentIds: input.departmentIds,
    },
  };
}

export async function updateRole(db: Database, id: number, input: UpdateInput) {
  const existing = await db.query.roles.findFirst({
    where: { id },
  });
  if (!existing) {
    return { success: false as const, reason: "not_found" as const };
  }

  await db
    .update(roles)
    .set({
      name: input.name ?? existing.name,
      description: input.description ?? existing.description,
      dataScope: input.dataScope ?? existing.dataScope,
      sort: input.sort ?? existing.sort,
      updatedAt: new Date(),
    })
    .where(eq(roles.id, id));

  // Update permissions if provided
  if (input.permissionIds !== undefined) {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
    for (const pid of input.permissionIds) {
      await db.insert(rolePermissions).values({
        roleId: id,
        permissionId: pid,
      });
    }
  }

  // Update departments if provided
  if (input.departmentIds !== undefined) {
    await db.delete(roleDepartments).where(eq(roleDepartments.roleId, id));
    for (const did of input.departmentIds) {
      await db.insert(roleDepartments).values({
        roleId: id,
        departmentId: did,
      });
    }
  }

  const updatedRole = await db.query.roles.findFirst({
    where: { id },
  });

  if (!updatedRole) {
    throw new Error("Failed to load updated role");
  }

  const rPerms = await db
    .select({ permissionId: rolePermissions.permissionId })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, id));

  const rDepts = await db
    .select({ departmentId: roleDepartments.departmentId })
    .from(roleDepartments)
    .where(eq(roleDepartments.roleId, id));

  return {
    success: true as const,
    role: {
      ...updatedRole,
      permissionIds: rPerms.map((p) => p.permissionId),
      departmentIds: rDepts.map((d) => d.departmentId),
    },
  };
}

export async function deleteRole(db: Database, id: number) {
  const existing = await db.query.roles.findFirst({
    where: { id },
  });
  if (!existing) {
    return { success: false as const, reason: "not_found" as const };
  }

  if (existing.isSystem) {
    return {
      success: false as const,
      reason: "system_role_protected" as const,
    };
  }

  await db.delete(roles).where(eq(roles.id, id));
  return { success: true as const };
}
