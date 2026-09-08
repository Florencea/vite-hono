import { createRouter } from "../../common/factory.ts";
import {
  getUserInfoHandler,
  loginHandler,
  logoutHandler,
} from "./auth.handlers.ts";
import { getUserInfoRoute, loginRoute, logoutRoute } from "./auth.routes.ts";

export const authRouter = createRouter()
  .openapi(loginRoute, loginHandler)
  .openapi(logoutRoute, logoutHandler)
  .openapi(getUserInfoRoute, getUserInfoHandler);

export * from "./auth.routes.ts";
export * from "./auth.schema.ts";
export * from "./auth.service.ts";
