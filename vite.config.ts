import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { join } from "node:path";
import { defineConfig, loadEnv, build as viteBuild } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_WEB_BASE || "/";
  const outDir = env.VITE_OUTDIR || "dist";

  return {
    base,
    build: {
      outDir: join(outDir, "client"),
      chunkSizeWarningLimit: 1000,
    },
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
        routesDirectory: "./src/client/routes",
        generatedRouteTree: "./src/client/routeTree.gen.ts",
      }),
      react(),
      tailwindcss(),
      {
        name: "server-builder",
        apply: "build",
        closeBundle: async () => {
          await viteBuild({
            configFile: false,
            publicDir: false,
            build: {
              ssr: "./src/server/app.ts",
              outDir: join(outDir, "server"),
            },
          });
        },
      },
    ],
  };
});
