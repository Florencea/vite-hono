import { createRouter } from "./common/factory.ts";
import { authRouter } from "./routes/auth/index.ts";

export const apiRouter = createRouter().route("/auth", authRouter);

export type AppRouter = typeof apiRouter;
export type AppType = typeof apiRouter;
