import { db } from "../src/server/database/index.ts";
import { seedDatabase } from "../src/server/database/seed.ts";

export default async function globalSetup(): Promise<void> {
  await seedDatabase(db);
}
