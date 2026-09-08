import type { SessionData } from "./auth.ts";

export interface AppContextVariables {
  session?: SessionData | null;
  language?: string;
}
