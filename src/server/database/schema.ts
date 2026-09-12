import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ==========================================
// 1. Departments (Hierarchical tree structure with materialized path)
// ==========================================
export const departments = sqliteTable("Department", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  parentId: integer("parentId"),
  name: text("name").notNull(),
  path: text("path").notNull(), // e.g. "/1/", "/1/2/"
  sort: integer("sort").notNull().default(0),
  leaderId: integer("leaderId"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`)
    .$onUpdate(() => new Date()),
});

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

// ==========================================
// 2. Roles and Data Scopes
// ==========================================
export const dataScopeEnum = [
  "ALL",
  "DEPT_AND_CHILD",
  "DEPT",
  "SELF",
  "CUSTOM",
] as const;
export type DataScopeType = (typeof dataScopeEnum)[number];

export const roles = sqliteTable("Role", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  dataScope: text("dataScope", { enum: dataScopeEnum })
    .notNull()
    .default("SELF"),
  sort: integer("sort").notNull().default(0),
  isSystem: integer("isSystem", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`)
    .$onUpdate(() => new Date()),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

// ==========================================
// 3. Permissions (Fine-grained feature and button permissions)
// ==========================================
export const permissions = sqliteTable("Permission", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  parentId: integer("parentId"),
  code: text("code").notNull().unique(), // e.g. 'system:role:read', 'system:role:create'
  name: text("name").notNull(),
  type: text("type", { enum: ["menu", "button"] }).notNull(),
  sort: integer("sort").notNull().default(0),
});

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

// ==========================================
// 4. Role - Permission Association
// ==========================================
export const rolePermissions = sqliteTable(
  "RolePermission",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roleId: integer("roleId")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: integer("permissionId")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("role_permission_idx").on(t.roleId, t.permissionId)],
);

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;

// ==========================================
// 5. Role - Department Association (for CUSTOM dataScope)
// ==========================================
export const roleDepartments = sqliteTable(
  "RoleDepartment",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roleId: integer("roleId")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    departmentId: integer("departmentId")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("role_department_idx").on(t.roleId, t.departmentId)],
);

export type RoleDepartment = typeof roleDepartments.$inferSelect;
export type NewRoleDepartment = typeof roleDepartments.$inferInsert;

// ==========================================
// 6. Users (ERP-ready: employee number, title, manager, status, department)
// ==========================================
export const userStatusEnum = ["active", "inactive", "suspended"] as const;
export type UserStatusType = (typeof userStatusEnum)[number];

export const users = sqliteTable("User", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uid: text("uid")
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),
  account: text("account").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  employeeNo: text("employeeNo"),
  title: text("title"),
  status: text("status", { enum: userStatusEnum }).notNull().default("active"),
  departmentId: integer("departmentId"),
  reportsToId: integer("reportsToId"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`)
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ==========================================
// 7. User - Role Association (Supports multidimensional scopeType extensions)
// ==========================================
export const userRoles = sqliteTable(
  "UserRole",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("roleId")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    scopeType: text("scopeType").notNull().default("global"),
    scopeId: text("scopeId"),
  },
  (t) => [
    uniqueIndex("user_role_scope_idx").on(
      t.userId,
      t.roleId,
      t.scopeType,
      t.scopeId,
    ),
  ],
);

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
