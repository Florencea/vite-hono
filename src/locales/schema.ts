/**
 * Single Source of Truth (SSOT) for the application's translation dictionary structure.
 * Every supported language must implement `satisfies LocaleSchema`.
 */
export interface LocaleSchema {
  common: {
    logout: string;
    submit: string;
    changeLanguage: string;
    add: string;
    edit: string;
    delete: string;
    cancel: string;
    save: string;
    actions: string;
    confirmDelete: string;
    search: string;
    reset: string;
    status: string;
    success: string;
  };
  auth: {
    login: string;
    account: string;
    password: string;
  };
  routes: {
    "/": string;
    "/login": string;
    "/user": string;
    "/departments": string;
    "/roles": string;
    "/403": string;
  };
  dept: {
    name: string;
    parent: string;
    root: string;
    sort: string;
    leader: string;
    create: string;
    edit: string;
  };
  role: {
    code: string;
    name: string;
    description: string;
    dataScope: string;
    permissions: string;
    customDepts: string;
    create: string;
    edit: string;
    scopes: {
      ALL: string;
      DEPT_AND_CHILD: string;
      DEPT: string;
      SELF: string;
      CUSTOM: string;
    };
  };
  user: {
    account: string;
    name: string;
    employeeNo: string;
    title: string;
    password: string;
    department: string;
    roles: string;
    create: string;
    edit: string;
    statusActive: string;
    statusInactive: string;
    statusSuspended: string;
  };
  forbidden: {
    title: string;
    description: string;
    backHome: string;
  };
  errors: {
    auth: {
      userNotFound: string;
      wrongPassword: string;
      unauthorized: string;
      forbidden: string;
    };
    dept: {
      notFound: string;
      hasChildren: string;
      hasUsers: string;
    };
    role: {
      notFound: string;
      codeExists: string;
      systemRoleProtected: string;
    };
    user: {
      notFound: string;
      accountExists: string;
      cannotDeleteAdmin: string;
    };
    common: {
      notFound: string;
      internalServerError: string;
      invalidRequest: string;
    };
  };
}

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never;

type Leaves<T> = T extends object
  ? { [K in keyof T]-?: Join<K, Leaves<T[K]>> }[keyof T]
  : "";

/**
 * Union of all valid dot-separated key paths in `LocaleSchema`.
 * Provides full autocompletion and compile-time key validation.
 */
export type TranslationKey = Leaves<LocaleSchema>;

export type TranslationParams = Record<string, string | number>;
