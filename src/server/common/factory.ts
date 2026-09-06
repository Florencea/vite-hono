import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppContextVariables } from "../context.js";

export type AppEnv = {
  Variables: AppContextVariables;
};

export function createRouter() {
  return new OpenAPIHono<AppEnv>();
}
