import { createClient } from "@libsql/client";
import { eq, sql } from "drizzle-orm";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { defineRelations } from "drizzle-orm/relations";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "../auth.ts";
import { db, type Database } from "./index.ts";
import * as schema from "./schema.ts";
import { users } from "./schema.ts";

export const DEFAULT_ADMIN = {
  account: "admin",
  password: "string",
} as const;

const relations = defineRelations(schema);

export async function seedDatabase(targetDb: Database): Promise<void> {
  // Ensure User table schema exists
  await targetDb.run(
    sql`CREATE TABLE IF NOT EXISTS User (
      id integer PRIMARY KEY AUTOINCREMENT,
      uid text NOT NULL UNIQUE,
      createdAt integer DEFAULT (strftime('%s', 'now')) NOT NULL,
      updatedAt integer DEFAULT (strftime('%s', 'now')) NOT NULL,
      account text NOT NULL UNIQUE,
      password text NOT NULL
    );`,
  );

  const hashedPassword = await hashPassword(DEFAULT_ADMIN.password);
  const existing = await targetDb.query.users.findFirst({
    where: { account: DEFAULT_ADMIN.account },
  });

  if (existing) {
    await targetDb
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.account, DEFAULT_ADMIN.account));
  } else {
    await targetDb.insert(users).values({
      account: DEFAULT_ADMIN.account,
      password: hashedPassword,
    });
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
