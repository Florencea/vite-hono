/**
 * Client Application Configuration (Single Source of Truth)
 *
 * Defines static application specifications and constants.
 * Eliminates implicit build-time environment variable replacements.
 */
const APP_CONFIG = {
  title: "Test Vite Hono",
} as const;

export const APP_TITLE = APP_CONFIG.title;
