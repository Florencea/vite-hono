import type { SessionData } from "./auth.ts";
import type { DataScopeType } from "./database/schema.ts";

export interface AuthUserDetail {
  id: number;
  account: string;
  name: string | null;
  employeeNo: string | null;
  title: string | null;
  departmentId: number | null;
  roles: string[];
  permissions: string[];
  dataScopes: DataScopeType[];
}

export interface AppContextVariables {
  session?: SessionData | null;
  user?: AuthUserDetail | null;
  language?: string;
}
