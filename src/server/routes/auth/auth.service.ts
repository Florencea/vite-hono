import { verifyPassword } from "../../auth.js";
import type { Database } from "../../database/index.js";

export type AuthenticateResult =
  | { success: true; user: { id: number; account: string } }
  | { success: false; reason: "user_not_found" | "wrong_password" };

export async function authenticateUser(
  db: Database,
  account: string,
  password: string,
): Promise<AuthenticateResult> {
  const user = await db.query.users.findFirst({
    where: { account },
  });

  if (!user) {
    return { success: false, reason: "user_not_found" };
  }

  const match = await verifyPassword(user.password, password);
  if (!match) {
    return { success: false, reason: "wrong_password" };
  }

  return {
    success: true,
    user: {
      id: user.id,
      account: user.account,
    },
  };
}
