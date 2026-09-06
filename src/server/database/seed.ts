import { eq } from "drizzle-orm";
import { hashPassword } from "../auth.ts";
import { db } from "./index.ts";
import { users } from "./schema.ts";

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
