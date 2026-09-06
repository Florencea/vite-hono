import { eq } from "drizzle-orm";
import { hashPassword } from "../auth.js";
import { db } from "./index.js";
import { users } from "./schema.js";

const DEFAULT_ADMIN = {
  account: "admin",
  password: "string",
};

async function main() {
  const hashedPassword = await hashPassword(DEFAULT_ADMIN.password);
  const existing = await db.query.users.findFirst({
    where: { account: DEFAULT_ADMIN.account },
  });

  if (existing) {
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.account, DEFAULT_ADMIN.account));
  } else {
    await db.insert(users).values({
      account: DEFAULT_ADMIN.account,
      password: hashedPassword,
    });
  }
}

main()
  .then(() => {
    console.log("Database seed completed.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
