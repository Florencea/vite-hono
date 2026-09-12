import { existsSync, rmSync } from "node:fs";

export default async function globalSetup(): Promise<() => void> {
  process.env.DATABASE_URL = "file:./database.test.sqlite";

  const cleanTestDb = () => {
    for (const file of [
      "database.test.sqlite",
      "database.test.sqlite-journal",
    ]) {
      if (existsSync(file)) {
        rmSync(file, { force: true });
      }
    }
  };

  cleanTestDb();

  const { db } = await import("../src/server/database/index.ts");
  const { seedDatabase } = await import("../src/server/database/seed.ts");

  await seedDatabase(db);

  return () => {
    cleanTestDb();
  };
}
