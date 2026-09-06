import { createCoreApp } from "./core.js";
import { apiRouter } from "./router.js";

const app = createCoreApp();

export type AppType = typeof apiRouter;
export default app;
