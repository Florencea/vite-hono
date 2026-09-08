import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/client",
    chunkSizeWarningLimit: 1000,
  },
  plugins: [tanstackRouter(), react(), tailwindcss()],
});
