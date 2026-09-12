import { asc, eq, like } from "drizzle-orm";
import type { Database } from "../../database/index.ts";
import { departments } from "../../database/schema.ts";
import type {
  CreateDepartmentReqSchema,
  UpdateDepartmentReqSchema,
} from "./department.schema.ts";
import type { z } from "@hono/zod-openapi";

type CreateInput = z.infer<typeof CreateDepartmentReqSchema>;
type UpdateInput = z.infer<typeof UpdateDepartmentReqSchema>;

export async function getDepartmentList(db: Database) {
  return await db
    .select()
    .from(departments)
    .orderBy(asc(departments.sort), asc(departments.id));
}

export async function createDepartment(db: Database, input: CreateInput) {
  let parentPath = "";
  if (input.parentId) {
    const parent = await db.query.departments.findFirst({
      where: { id: input.parentId },
    });
    if (!parent)
      return { success: false as const, reason: "parent_not_found" as const };
    parentPath = parent.path;
  }

  // Insert department
  const inserted = await db
    .insert(departments)
    .values({
      name: input.name,
      parentId: input.parentId ?? null,
      path: "",
      sort: input.sort,
      leaderId: input.leaderId ?? null,
    })
    .returning();

  const dept = inserted[0];

  const finalPath = parentPath
    ? `${parentPath}${dept.id.toString()}/`
    : `/${dept.id.toString()}/`;

  await db
    .update(departments)
    .set({ path: finalPath })
    .where(eq(departments.id, dept.id));

  return { success: true as const, department: { ...dept, path: finalPath } };
}

export async function updateDepartment(
  db: Database,
  id: number,
  input: UpdateInput,
) {
  const existing = await db.query.departments.findFirst({
    where: { id },
  });
  if (!existing)
    return { success: false as const, reason: "not_found" as const };

  let newPath = existing.path;

  // If parent changed, recalculate materialized path recursively
  if (input.parentId !== undefined && input.parentId !== existing.parentId) {
    let parentPath = "";
    if (input.parentId !== null) {
      const parent = await db.query.departments.findFirst({
        where: { id: input.parentId },
      });
      if (!parent)
        return { success: false as const, reason: "parent_not_found" as const };
      parentPath = parent.path;
    }

    newPath = parentPath
      ? `${parentPath}${id.toString()}/`
      : `/${id.toString()}/`;

    // Cascade update descendants
    const oldPrefix = existing.path;
    const descendants = await db
      .select()
      .from(departments)
      .where(like(departments.path, `${oldPrefix}%`));

    for (const desc of descendants) {
      if (desc.id === id) continue;
      const updatedDescPath = desc.path.replace(oldPrefix, newPath);
      await db
        .update(departments)
        .set({ path: updatedDescPath })
        .where(eq(departments.id, desc.id));
    }
  }

  await db
    .update(departments)
    .set({
      name: input.name ?? existing.name,
      parentId:
        input.parentId !== undefined ? input.parentId : existing.parentId,
      path: newPath,
      sort: input.sort ?? existing.sort,
      leaderId:
        input.leaderId !== undefined ? input.leaderId : existing.leaderId,
      updatedAt: new Date(),
    })
    .where(eq(departments.id, id));

  const updated = await db.query.departments.findFirst({
    where: { id },
  });

  if (!updated) {
    throw new Error("Failed to load updated department");
  }

  return { success: true as const, department: updated };
}

export async function deleteDepartment(db: Database, id: number) {
  const existing = await db.query.departments.findFirst({
    where: { id },
  });
  if (!existing)
    return { success: false as const, reason: "not_found" as const };

  // Check if department has child departments
  const child = await db.query.departments.findFirst({
    where: { parentId: id },
  });
  if (child)
    return { success: false as const, reason: "has_children" as const };

  // Check if department has assigned users
  const user = await db.query.users.findFirst({
    where: { departmentId: id },
  });
  if (user) return { success: false as const, reason: "has_users" as const };

  await db.delete(departments).where(eq(departments.id, id));
  return { success: true as const };
}
