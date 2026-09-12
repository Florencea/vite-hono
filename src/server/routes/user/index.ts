import { createRouter } from "../../common/factory.ts";
import {
  createUserHandler,
  deleteUserHandler,
  listUsersHandler,
  updateUserHandler,
} from "./user.handlers.ts";
import {
  createUserRoute,
  deleteUserRoute,
  listUsersRoute,
  updateUserRoute,
} from "./user.routes.ts";

export const userRouter = createRouter()
  .openapi(listUsersRoute, listUsersHandler)
  .openapi(createUserRoute, createUserHandler)
  .openapi(updateUserRoute, updateUserHandler)
  .openapi(deleteUserRoute, deleteUserHandler);
