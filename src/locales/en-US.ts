import type { LocaleSchema } from "./schema.ts";

export default {
  common: {
    logout: "Logout",
    submit: "Submit",
    changeLanguage: "Change Language",
  },
  auth: {
    login: "Login",
    account: "Account",
    password: "Password",
  },
  routes: {
    "/": "Welcome",
    "/login": "Login",
    "/user": "Users",
  },
  errors: {
    auth: {
      userNotFound: "User not found",
      wrongPassword: "Wrong password",
      unauthorized: "Unauthorized. Please log in first.",
      forbidden: "Access forbidden.",
    },
    common: {
      notFound: "Resource not found",
      internalServerError: "Internal server error",
      invalidRequest: "Invalid request payload",
    },
  },
} as const satisfies LocaleSchema;
