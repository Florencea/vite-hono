import { createRouter } from "./common/factory.ts";
import { authRouter } from "./routes/auth/index.ts";
import { departmentRouter } from "./routes/department/index.ts";
import { permissionRouter } from "./routes/permission/index.ts";
import { roleRouter } from "./routes/role/index.ts";
import { userRouter } from "./routes/user/index.ts";

export const apiRouter = createRouter()
  .route("/auth", authRouter)
  .route("/departments", departmentRouter)
  .route("/roles", roleRouter)
  .route("/permissions", permissionRouter)
  .route("/users", userRouter);

export type AppType = typeof apiRouter;
