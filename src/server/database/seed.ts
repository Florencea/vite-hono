import { createClient } from "@libsql/client";
import { eq, is, SQL, sql } from "drizzle-orm";
import {
  getTableConfig,
  SQLiteDialect,
  SQLiteTable,
} from "drizzle-orm/sqlite-core";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { defineRelations } from "drizzle-orm/relations";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "../auth.ts";
import { db, type Database } from "./index.ts";
import * as schema from "./schema.ts";

export const DEFAULT_ADMIN = {
  account: "admin",
  password: "string",
} as const;

const relations = defineRelations(schema);
const dialect = new SQLiteDialect();

export function generateCreateTableSql(table: SQLiteTable): string {
  const config = getTableConfig(table);
  const colDefs: string[] = [];

  for (const col of config.columns) {
    const parts = [`"${col.name}"`, col.getSQLType()];
    if (col.primary) {
      const isAutoIncrement =
        "autoIncrement" in col && Boolean(col.autoIncrement);
      parts.push(isAutoIncrement ? "PRIMARY KEY AUTOINCREMENT" : "PRIMARY KEY");
    }
    if (col.notNull) {
      parts.push("NOT NULL");
    }
    if (col.isUnique) {
      parts.push("UNIQUE");
    }
    if (col.default !== undefined) {
      if (col.default instanceof SQL) {
        parts.push(`DEFAULT ${dialect.sqlToQuery(col.default).sql}`);
      } else if (typeof col.default === "string") {
        parts.push(`DEFAULT '${col.default.replace(/'/g, "''")}'`);
      } else if (
        typeof col.default === "number" ||
        typeof col.default === "boolean"
      ) {
        parts.push(`DEFAULT ${col.default.toString()}`);
      }
    }
    colDefs.push(parts.join(" "));
  }

  return `CREATE TABLE IF NOT EXISTS "${config.name}" (\n  ${colDefs.join(",\n  ")}\n);`;
}

export async function syncDatabaseSchema(targetDb: Database): Promise<void> {
  for (const val of Object.values(schema)) {
    if (is(val, SQLiteTable)) {
      const ddl = generateCreateTableSql(val);
      await targetDb.run(sql.raw(ddl));

      // Handle newly added columns for existing tables in SQLite
      const config = getTableConfig(val);
      try {
        const infoRes = (await targetDb.all(
          sql.raw(`PRAGMA table_info("${config.name}")`),
        )) as unknown as { name: string }[];
        const existingColNames = new Set(infoRes.map((r) => r.name));

        for (const col of config.columns) {
          if (!existingColNames.has(col.name)) {
            let colDef = `ALTER TABLE "${config.name}" ADD COLUMN "${col.name}" ${col.getSQLType()}`;
            if (col.default !== undefined) {
              if (col.default instanceof SQL) {
                colDef += ` DEFAULT ${dialect.sqlToQuery(col.default).sql}`;
              } else if (typeof col.default === "string") {
                colDef += ` DEFAULT '${col.default.replace(/'/g, "''")}'`;
              } else if (
                typeof col.default === "number" ||
                typeof col.default === "boolean"
              ) {
                colDef += ` DEFAULT ${col.default.toString()}`;
              }
            }
            await targetDb.run(sql.raw(colDef));
          }
        }
      } catch {
        // Ignored if PRAGMA is restricted or not supported in environment
      }
    }
  }
}

export const INITIAL_PERMISSIONS = [
  // Department management
  {
    code: "system:dept:read",
    name: "查看部門",
    type: "menu" as const,
    sort: 10,
  },
  {
    code: "system:dept:create",
    name: "新增部門",
    type: "button" as const,
    sort: 11,
  },
  {
    code: "system:dept:update",
    name: "編輯部門",
    type: "button" as const,
    sort: 12,
  },
  {
    code: "system:dept:delete",
    name: "刪除部門",
    type: "button" as const,
    sort: 13,
  },

  // Role management
  {
    code: "system:role:read",
    name: "查看角色",
    type: "menu" as const,
    sort: 20,
  },
  {
    code: "system:role:create",
    name: "新增角色",
    type: "button" as const,
    sort: 21,
  },
  {
    code: "system:role:update",
    name: "編輯角色",
    type: "button" as const,
    sort: 22,
  },
  {
    code: "system:role:delete",
    name: "刪除角色",
    type: "button" as const,
    sort: 23,
  },

  // User management
  {
    code: "system:user:read",
    name: "查看使用者",
    type: "menu" as const,
    sort: 30,
  },
  {
    code: "system:user:create",
    name: "新增使用者",
    type: "button" as const,
    sort: 31,
  },
  {
    code: "system:user:update",
    name: "編輯使用者",
    type: "button" as const,
    sort: 32,
  },
  {
    code: "system:user:delete",
    name: "刪除使用者",
    type: "button" as const,
    sort: 33,
  },
];

export async function seedDatabase(targetDb: Database): Promise<void> {
  // Ensure all tables defined in schema.ts exist dynamically
  await syncDatabaseSchema(targetDb);

  // 1. Seed Permissions
  for (const perm of INITIAL_PERMISSIONS) {
    const existingPerm = await targetDb.query.permissions.findFirst({
      where: { code: perm.code },
    });
    if (!existingPerm) {
      await targetDb.insert(schema.permissions).values(perm);
    }
  }

  // 2. Seed Departments
  const existingDept = await targetDb.query.departments.findFirst();
  let rootDeptId: number;
  if (!existingDept) {
    const rootRes = await targetDb
      .insert(schema.departments)
      .values({
        name: "總部",
        path: "/1/",
        sort: 1,
      })
      .returning({ id: schema.departments.id });
    rootDeptId = rootRes[0]?.id ?? 1;

    await targetDb.insert(schema.departments).values([
      {
        name: "研發部",
        parentId: rootDeptId,
        path: `/${rootDeptId.toString()}/2/`,
        sort: 1,
      },
      {
        name: "業務部",
        parentId: rootDeptId,
        path: `/${rootDeptId.toString()}/3/`,
        sort: 2,
      },
    ]);
  } else {
    rootDeptId = existingDept.id;
  }

  // 3. Seed Roles
  const superAdminRole = await targetDb.query.roles.findFirst({
    where: { code: "super_admin" },
  });
  let superAdminRoleId = superAdminRole?.id;

  if (!superAdminRole) {
    const inserted = await targetDb
      .insert(schema.roles)
      .values({
        code: "super_admin",
        name: "超級管理員",
        description: "系統最高權限，可管理所有模組與全公司資料",
        dataScope: "ALL",
        isSystem: true,
        sort: 1,
      })
      .returning({ id: schema.roles.id });
    superAdminRoleId = inserted[0]?.id;
  }

  const deptManagerRole = await targetDb.query.roles.findFirst({
    where: { code: "dept_manager" },
  });
  if (!deptManagerRole) {
    await targetDb.insert(schema.roles).values({
      code: "dept_manager",
      name: "部門主管",
      description: "可管理本部門及子部門的使用者與組織",
      dataScope: "DEPT_AND_CHILD",
      isSystem: false,
      sort: 2,
    });
  }

  const employeeRole = await targetDb.query.roles.findFirst({
    where: { code: "employee" },
  });
  if (!employeeRole) {
    await targetDb.insert(schema.roles).values({
      code: "employee",
      name: "一般員工",
      description: "一般使用者權限，僅能查看基本資訊",
      dataScope: "SELF",
      isSystem: false,
      sort: 3,
    });
  }

  // 4. Assign Permissions to roles
  if (superAdminRoleId) {
    const allPerms = await targetDb.query.permissions.findMany();
    for (const p of allPerms) {
      const existingRel = await targetDb.query.rolePermissions.findFirst({
        where: {
          roleId: superAdminRoleId,
          permissionId: p.id,
        },
      });
      if (!existingRel) {
        await targetDb.insert(schema.rolePermissions).values({
          roleId: superAdminRoleId,
          permissionId: p.id,
        });
      }
    }
  }

  const currentDeptManagerRole = await targetDb.query.roles.findFirst({
    where: { code: "dept_manager" },
  });
  if (currentDeptManagerRole) {
    const managerPermCodes = [
      "system:dept:read",
      "system:dept:create",
      "system:dept:update",
      "system:user:read",
      "system:user:create",
      "system:user:update",
      "system:role:read",
    ];
    for (const code of managerPermCodes) {
      const p = await targetDb.query.permissions.findFirst({ where: { code } });
      if (p) {
        const existingRel = await targetDb.query.rolePermissions.findFirst({
          where: { roleId: currentDeptManagerRole.id, permissionId: p.id },
        });
        if (!existingRel) {
          await targetDb.insert(schema.rolePermissions).values({
            roleId: currentDeptManagerRole.id,
            permissionId: p.id,
          });
        }
      }
    }
  }

  const currentEmployeeRole = await targetDb.query.roles.findFirst({
    where: { code: "employee" },
  });
  if (currentEmployeeRole) {
    const p = await targetDb.query.permissions.findFirst({
      where: { code: "system:user:read" },
    });
    if (p) {
      const existingRel = await targetDb.query.rolePermissions.findFirst({
        where: { roleId: currentEmployeeRole.id, permissionId: p.id },
      });
      if (!existingRel) {
        await targetDb.insert(schema.rolePermissions).values({
          roleId: currentEmployeeRole.id,
          permissionId: p.id,
        });
      }
    }
  }

  // 5. Seed / Update Admin User
  const hashedPassword = await hashPassword(DEFAULT_ADMIN.password);
  const existingUser = await targetDb.query.users.findFirst({
    where: { account: DEFAULT_ADMIN.account },
  });

  let adminUserId = existingUser?.id;

  if (existingUser) {
    await targetDb
      .update(schema.users)
      .set({
        password: hashedPassword,
        name: "系統管理員",
        departmentId: rootDeptId,
        isSystem: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.account, DEFAULT_ADMIN.account));
  } else {
    const insertedUser = await targetDb
      .insert(schema.users)
      .values({
        account: DEFAULT_ADMIN.account,
        password: hashedPassword,
        name: "系統管理員",
        departmentId: rootDeptId,
        isSystem: true,
      })
      .returning({ id: schema.users.id });
    adminUserId = insertedUser[0]?.id;
  }

  // 6. Assign super_admin role to admin user
  if (adminUserId && superAdminRoleId) {
    const existingUserRole = await targetDb.query.userRoles.findFirst({
      where: {
        userId: adminUserId,
        roleId: superAdminRoleId,
      },
    });
    if (!existingUserRole) {
      await targetDb.insert(schema.userRoles).values({
        userId: adminUserId,
        roleId: superAdminRoleId,
      });
    }
  }
}

export async function seedAllDatabases(): Promise<void> {
  console.info("[seed] Seeding primary database...");
  await seedDatabase(db);

  // Also seed local Cloudflare D1 database if present in .wrangler
  const d1Dir = join(
    process.cwd(),
    ".wrangler",
    "state",
    "v3",
    "d1",
    "miniflare-D1DatabaseObject",
  );
  if (existsSync(d1Dir)) {
    const files = readdirSync(d1Dir).filter(
      (f) => f.endsWith(".sqlite") && !f.startsWith("metadata"),
    );
    for (const file of files) {
      console.info(`[seed] Seeding local Cloudflare D1 database (${file})...`);
      const client = createClient({ url: `file:${join(d1Dir, file)}` });
      const d1Db = drizzleLibsql({ client, relations });
      await seedDatabase(d1Db);
    }
  }
}

const isDirectExecution =
  Boolean(process.argv[1]) &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  seedAllDatabases()
    .then(() => {
      console.info("[seed] Database seed completed successfully.");
      process.exit(0);
    })
    .catch((e: unknown) => {
      console.error("[seed] Database seed failed:", e);
      process.exit(1);
    });
}
