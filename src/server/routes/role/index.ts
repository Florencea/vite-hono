import { createRouter } from "../../common/factory.ts";
import {
  createRoleHandler,
  deleteRoleHandler,
  listRolesHandler,
  updateRoleHandler,
} from "./role.handlers.ts";
import {
  createRoleRoute,
  deleteRoleRoute,
  listRolesRoute,
  updateRoleRoute,
} from "./role.routes.ts";

export const roleRouter = createRouter()
  .openapi(listRolesRoute, listRolesHandler)
  .openapi(createRoleRoute, createRoleHandler)
  .openapi(updateRoleRoute, updateRoleHandler)
  .openapi(deleteRoleRoute, deleteRoleHandler);
