import { createClient } from "@libsql/client";
import "dotenv/config";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { defineRelations } from "drizzle-orm/relations";
import type { Context } from "hono";
import { DATABASE_URL } from "../config.ts";
import * as schema from "./schema.ts";

const connectionString = DATABASE_URL;

const relations = defineRelations(schema);

const getLibsqlDb = () => {
  const client = createClient({
    url: connectionString,
  });
  return drizzleLibsql({ client, relations });
};

export type Database = ReturnType<typeof getLibsqlDb>;

interface CloudflareEnv {
  DB?: Parameters<typeof drizzleD1>[0];
}

let _db: Database | undefined;

export function getDb(c?: Context): Database {
  const env = c?.env as CloudflareEnv | undefined;
  if (env?.DB) {
    return drizzleD1(env.DB, { relations });
  }
  _db ??= getLibsqlDb();
  return _db;
}

export const db: Database = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    const targetDb = getDb();
    const value = Reflect.get(targetDb, prop, receiver) as unknown;
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(targetDb)
      : value;
  },
});
