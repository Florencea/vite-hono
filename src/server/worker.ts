import { createCoreApp } from "./core.ts";
import { apiRouter } from "./router.ts";

const app = createCoreApp();

export type AppType = typeof apiRouter;
export default app;
