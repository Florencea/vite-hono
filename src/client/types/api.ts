import type { InferRequestType, InferResponseType } from "hono/client";
import type { api } from "../api.ts";

type DepartmentsApi = (typeof api)["departments"];
type RolesApi = (typeof api)["roles"];
type UsersApi = (typeof api)["users"];
type AuthApi = (typeof api)["auth"];
type PermissionsApi = (typeof api)["permissions"];

/**
 * Backend-inferred Request Inputs
 */
export type RouterInputs = {
  auth: {
    login: InferRequestType<AuthApi["login"]["$post"]>["json"];
  };
  department: {
    create: InferRequestType<DepartmentsApi["$post"]>["json"];
    update: InferRequestType<DepartmentsApi[":id"]["$put"]>["json"];
  };
  role: {
    create: InferRequestType<RolesApi["$post"]>["json"];
    update: InferRequestType<RolesApi[":id"]["$put"]>["json"];
  };
  user: {
    create: InferRequestType<UsersApi["$post"]>["json"];
    update: InferRequestType<UsersApi[":id"]["$put"]>["json"];
  };
};

/**
 * Backend-inferred Response Outputs
 */
type RouterOutputs = {
  auth: {
    userInfo: InferResponseType<AuthApi["getUserInfo"]["$get"], 200>;
  };
  department: {
    list: InferResponseType<DepartmentsApi["$get"], 200>;
    item: InferResponseType<DepartmentsApi["$get"], 200>["items"][number];
  };
  role: {
    list: InferResponseType<RolesApi["$get"], 200>;
    item: InferResponseType<RolesApi["$get"], 200>["items"][number];
  };
  permission: {
    list: InferResponseType<PermissionsApi["$get"], 200>;
    item: InferResponseType<PermissionsApi["$get"], 200>["items"][number];
  };
  user: {
    list: InferResponseType<UsersApi["$get"], 200>;
    item: InferResponseType<UsersApi["$get"], 200>["items"][number];
  };
};

/**
 * Domain entity types directly derived from Single Source of Truth backend responses
 */
export type DepartmentItem = RouterOutputs["department"]["item"];
export type RoleItem = RouterOutputs["role"]["item"];
export type PermissionItem = RouterOutputs["permission"]["item"];
export type UserItem = RouterOutputs["user"]["item"];
