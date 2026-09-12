import { existsSync, rmSync } from "node:fs";

export default async function globalSetup(): Promise<() => void> {
  process.env.DATABASE_URL = "file:./database.test.sqlite";

  const cleanTestDb = () => {
    for (const file of [
      "database.test.sqlite",
      "database.test.sqlite-journal",
    ]) {
      if (existsSync(file)) {
        try {
          rmSync(file, { force: true });
        } catch {
          // On Windows, open handles or filesystem latency might prevent removal; safely ignore in teardown
        }
      }
    }
  };

  cleanTestDb();

  const { db, closeDb } = await import("../src/server/database/index.ts");
  const { seedDatabase } = await import("../src/server/database/seed.ts");

  await seedDatabase(db);
  closeDb();

  return () => {
    closeDb();
    cleanTestDb();
  };
}
