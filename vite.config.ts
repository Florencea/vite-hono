import { cloudflare } from "@cloudflare/vite-plugin";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode, isSsrBuild }) => {
  const isTest = mode === "test" || process.env.NODE_ENV === "test";

  return {
    build: {
      outDir: isSsrBuild ? "dist/server" : "dist/client",
      chunkSizeWarningLimit: 1000,
    },
    plugins: [
      tanstackRouter({
        autoCodeSplitting: true,
      }),
      react(),
      babel({
        presets: [reactCompilerPreset()],
      }),
      tailwindcss(),
      !isSsrBuild && !isTest && cloudflare(),
    ],
  };
});
