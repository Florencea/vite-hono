import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { cp, rm } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import { defineConfig, loadEnv, build as viteBuild, type PluginOption } from "vite";

const {
  VITE_WEB_BASE,
  VITE_OUTDIR = "dist",
  ENABLE_CLIENT,
  ENABLE_SERVER,
  ENABLE_OPENAPI,
} = loadEnv("development", cwd(), "");

const enableClient = ENABLE_CLIENT === "1";
const enableServer = ENABLE_SERVER === "1";
const enableOpenapi = ENABLE_OPENAPI === "1";

if (!enableServer && enableOpenapi) {
  throw new Error("Error: Server must be enabled when OpenAPI is enabled.");
}

const ServerBuilder = (): PluginOption => {
  return {
    name: "Server Builder",
    apply: "build",
    closeBundle: async () => {
      await viteBuild({
        configFile: false,
        publicDir: false,
        build: {
          ssr: "./src/server/app.ts",
          outDir: join(".", VITE_OUTDIR, "server"),
          chunkSizeWarningLimit: Infinity,
          reportCompressedSize: false,
        },
      });
    },
  };
};

const RemoveClientAssets = (): PluginOption => {
  return {
    name: "Remove Client Assets",
    apply: "build",
    closeBundle: async () => {
      const clientAssetsPath = enableServer
        ? join(".", VITE_OUTDIR, "client")
        : join(".", VITE_OUTDIR);
      await rm(clientAssetsPath, { recursive: true, force: true });
      if (enableOpenapi) {
        const openapiAssetsSourcePath = join(".", "public", "openapi");
        const openapiAssetsPath = enableServer
          ? join(".", VITE_OUTDIR, "client", "openapi")
          : join(".", VITE_OUTDIR, "openapi");
        await cp(openapiAssetsSourcePath, openapiAssetsPath, {
          recursive: true,
          force: true,
        });
      }
    },
  };
};

const RemoveOpenApiAssets = (): PluginOption => {
  return {
    name: "Remove OpenAPI Assets",
    apply: "build",
    renderStart: async () => {
      const openapiAssetsPath = enableServer
        ? join(".", VITE_OUTDIR, "client", "openapi")
        : join(".", VITE_OUTDIR, "openapi");
      await rm(openapiAssetsPath, { recursive: true, force: true });
    },
  };
};

export default defineConfig({
  base: VITE_WEB_BASE,
  build: {
    outDir: enableServer ? join(".", VITE_OUTDIR, "client") : VITE_OUTDIR,
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
    enableServer ? ServerBuilder() : undefined,
    enableClient ? undefined : RemoveClientAssets(),
    enableOpenapi ? undefined : RemoveOpenApiAssets(),
  ].filter(Boolean),
});
