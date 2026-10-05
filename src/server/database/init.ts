import { sql } from "drizzle-orm";
import type { Database } from "./index.ts";
import { seedDatabase } from "./seed.ts";

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export function resetDbInitState(): void {
  isInitialized = false;
  initPromise = null;
}

/**
 * Ensures that the target database has the expected schema and default administrative seed data.
 * Executes once on bootstrap or upon first API request; skips redundant queries on subsequent calls.
 */
export async function ensureDatabaseReady(targetDb: Database): Promise<void> {
  if (isInitialized) {
    return;
  }
  if (initPromise !== null) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    try {
      const tableCheck = await targetDb.all(
        sql.raw("SELECT name FROM sqlite_master WHERE type='table' AND name='User'"),
      );

      if (tableCheck.length === 0) {
        console.info(
          "[db] User table not found; dynamically creating schema and seeding database...",
        );
        await seedDatabase(targetDb);
      } else {
        const adminCheck = await targetDb.all(
          sql.raw("SELECT id FROM User WHERE account='admin' LIMIT 1"),
        );
        if (adminCheck.length === 0) {
          console.info("[db] Default admin account not found; seeding database...");
          await seedDatabase(targetDb);
        }
      }

      isInitialized = true;
    } catch (err) {
      console.error("[db] Failed to ensure database ready:", err);
      throw err;
    } finally {
      initPromise = null;
    }
  })();

  await initPromise;
}
