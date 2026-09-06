import { createRouter } from "../../common/factory.js";
import { getUserInfoHandler, loginHandler, logoutHandler } from "./auth.handlers.js";
import { getUserInfoRoute, loginRoute, logoutRoute } from "./auth.routes.js";

export const authRouter = createRouter()
  .openapi(loginRoute, loginHandler)
  .openapi(logoutRoute, logoutHandler)
  .openapi(getUserInfoRoute, getUserInfoHandler);

export * from "./auth.routes.js";
export * from "./auth.schema.js";
export * from "./auth.service.js";
