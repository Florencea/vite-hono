import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("User", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uid: text("uid")
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`)
    .$onUpdate(() => new Date()),
  account: text("account").notNull().unique(),
  password: text("password").notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
