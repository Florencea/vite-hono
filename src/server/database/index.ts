import { createClient } from "@libsql/client";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { defineRelations } from "drizzle-orm/relations";
import type { Context } from "hono";
import { DATABASE_URL } from "../config.ts";
import * as schema from "./schema.ts";

const relations = defineRelations(schema);

const getLibsqlDb = () => {
  const client = createClient({ url: DATABASE_URL });
  return drizzleLibsql({ client, relations });
};

export type Database = ReturnType<typeof getLibsqlDb>;

interface CloudflareEnv {
  DB?: Parameters<typeof drizzleD1>[0];
}

let cachedDb: Database | undefined;

export function closeDb(): void {
  if (cachedDb !== undefined) {
    cachedDb.$client.close();
    cachedDb = undefined;
  }
}

function isCloudflareEnv(env: unknown): env is CloudflareEnv {
  return typeof env === "object" && env !== null && "DB" in env;
}

export function getDb(c?: Context): Database {
  const rawEnv: unknown = c?.env;
  if (isCloudflareEnv(rawEnv) && rawEnv.DB !== undefined) {
    return drizzleD1(rawEnv.DB, { relations });
  }
  cachedDb ??= getLibsqlDb();
  return cachedDb;
}

function isDatabase(val: object): val is Database {
  return val !== null;
}

function createLazyDb(): Database {
  const target: object = {};
  if (isDatabase(target)) {
    return new Proxy(target, {
      get(_target, prop, receiver) {
        const targetDb = getDb();
        const value: unknown = Reflect.get(targetDb, prop, receiver);
        if (typeof value === "function") {
          return value.bind(targetDb);
        }
        return value;
      },
    });
  }
  return getDb();
}

export const db: Database = createLazyDb();
