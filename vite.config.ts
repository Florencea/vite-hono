import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { defineConfig, loadEnv, build as viteBuild } from "vite";

function inlineOpenApiPlugin() {
  return {
    name: "inline-openapi-assets",
    transform(_code: string, id: string) {
      if (id.includes("src/server/openapi/loader.ts")) {
        const openapiDir = dirname(id);
        const read = (file: string) => readFileSync(join(openapiDir, file), "utf-8");

        const description = read("description.md");
        const customCss = read("assets/custom.css");
        const themeCss = read("assets/theme.css");
        const cookieCss = read("assets/cookie.css");
        const customScript = read("assets/custom.js");

        const styles = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap');

html {
  box-sizing: border-box;
  overflow: -moz-scrollbars-vertical;
  overflow-y: scroll;
}

*, *:before, *:after {
  box-sizing: inherit;
}

body {
  margin: 0;
  background: #fafafa;
  font-feature-settings: "calt", "dlig", "ss01", "cv05", "cv08", "tnum", "opsz";
}

html.dark-mode,
html.dark-mode body {
  background: #1c2022;
  color: #e4e6e6;
}

${cookieCss}
${customCss}
${themeCss}
`;

        return {
          code: `
export const openapiDescription = ${JSON.stringify(description)};
export const customCss = ${JSON.stringify(customCss)};
export const themeCss = ${JSON.stringify(themeCss)};
export const cookieCss = ${JSON.stringify(cookieCss)};
export const customScript = ${JSON.stringify(customScript)};
export const openapiStyles = ${JSON.stringify(styles)};
`,
          map: null,
        };
      }
    },
  };
}

function stripOpenApiPlugin() {
  return {
    name: "strip-openapi",
    transform(code: string, id: string) {
      if (id.includes("src/server/app.ts")) {
        return {
          code: code.replace(
            /await\s+import\(\s*["']\.\/openapi\/index\.js["']\s*\)/g,
            "Promise.resolve({ openapiConfig: {}, renderSwaggerUiHtml: () => '' })",
          ),
          map: null,
        };
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_WEB_BASE || "/";
  const outDir = env.VITE_OUTDIR || "dist";
  const rawEnableOpenApi = process.env.ENABLE_OPENAPI ?? env.ENABLE_OPENAPI;
  const isEnableOpenApi = rawEnableOpenApi !== "0" && rawEnableOpenApi !== "false";

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
            define: {
              "process.env.ENABLE_OPENAPI": JSON.stringify(isEnableOpenApi ? "1" : "0"),
            },
            plugins: isEnableOpenApi ? [inlineOpenApiPlugin()] : [stripOpenApiPlugin()],
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
