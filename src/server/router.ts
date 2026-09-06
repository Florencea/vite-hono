import { createRouter } from "./common/factory.js";
import { authRouter } from "./routes/auth/index.js";

export const apiRouter = createRouter().route("/auth", authRouter);

export type AppRouter = typeof apiRouter;
export type AppType = typeof apiRouter;
