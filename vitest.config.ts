import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default defineConfig((env) => {
  const baseConfig =
    typeof viteConfig === "function" ? viteConfig(env) : viteConfig;

  return mergeConfig(
    baseConfig,
    defineConfig({
      optimizeDeps: {
        include: ["react-dom/client"],
      },
      test: {
        projects: [
          {
            test: {
              name: "client",
              include: ["test/client/**/*.{test,spec}.{ts,tsx}"],
              setupFiles: ["./test/client/setup.ts"],
              browser: {
                enabled: true,
                provider: playwright(),
                headless: true,
                instances: [{ browser: "chromium" }],
              },
            },
          },
          {
            test: {
              name: "server",
              include: [
                "test/server/**/*.{test,spec}.ts",
                "test/canary/**/*.{test,spec}.ts",
              ],
              environment: "node",
              setupFiles: ["./test/server/setup.ts"],
            },
          },
        ],
      },
    }),
  );
});
