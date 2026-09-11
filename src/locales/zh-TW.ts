import type { LocaleSchema } from "./schema.ts";

export default {
  common: {
    logout: "登出",
    submit: "送出",
    changeLanguage: "變更系統語系",
  },
  auth: {
    login: "登入",
    account: "帳號",
    password: "密碼",
  },
  routes: {
    "/": "歡迎",
    "/login": "登入",
    "/user": "帳號管理",
  },
  errors: {
    auth: {
      userNotFound: "使用者不存在",
      wrongPassword: "密碼錯誤",
      unauthorized: "未授權，請先登入",
      forbidden: "存取被拒絕，無此權限",
    },
    common: {
      notFound: "找不到請求的資源",
      internalServerError: "伺服器內部錯誤",
      invalidRequest: "無效的請求內容",
    },
  },
} as const satisfies LocaleSchema;
