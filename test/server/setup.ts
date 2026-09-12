import { afterAll } from "vitest";
import { closeDb } from "../../src/server/database/index.ts";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./database.test.sqlite";

afterAll(() => {
  closeDb();
});
