import { createRouter } from "../../common/factory.ts";
import {
  createDepartmentHandler,
  deleteDepartmentHandler,
  listDepartmentsHandler,
  updateDepartmentHandler,
} from "./department.handlers.ts";
import {
  createDepartmentRoute,
  deleteDepartmentRoute,
  listDepartmentsRoute,
  updateDepartmentRoute,
} from "./department.routes.ts";

export const departmentRouter = createRouter()
  .openapi(listDepartmentsRoute, listDepartmentsHandler)
  .openapi(createDepartmentRoute, createDepartmentHandler)
  .openapi(updateDepartmentRoute, updateDepartmentHandler)
  .openapi(deleteDepartmentRoute, deleteDepartmentHandler);
