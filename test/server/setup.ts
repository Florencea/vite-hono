import { afterAll } from "vite-plus/test";
import { closeDb } from "../../src/server/database/index.ts";
import { resetDbInitState } from "../../src/server/database/init.ts";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./database.test.sqlite";

afterAll(() => {
  closeDb();
  resetDbInitState();
});
