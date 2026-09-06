import { createRoute } from "@hono/zod-openapi";
import { EmptyResSchema, ErrorResSchema } from "../../common/schemas.ts";
import { LoginReqSchema, UserInfoResSchema } from "./auth.schema.ts";

export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  summary: "User login",
  description: "Authenticate user and establish session",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginReqSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: EmptyResSchema,
        },
      },
      description: "Login successful",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResSchema,
        },
      },
      description: "Bad request",
    },
  },
});

export const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  summary: "User logout",
  description: "Destroy session and clear cookie",
  tags: ["Auth"],
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: EmptyResSchema,
        },
      },
      description: "Logout successful",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResSchema,
        },
      },
      description: "Unauthorized",
    },
  },
});

export const getUserInfoRoute = createRoute({
  method: "get",
  path: "/getUserInfo",
  summary: "Get user info",
  description: "Retrieve authenticated user details and status",
  tags: ["Auth"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserInfoResSchema,
        },
      },
      description: "User details",
    },
  },
});
