import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";
import { APP_TITLE } from "./src/client/config.ts";

export default defineConfig(({ mode, isSsrBuild }) => {
  const isTest = mode === "test" || process.env.NODE_ENV === "test";

  return {
    build: {
      outDir: isSsrBuild ? "dist/server" : "dist",
      chunkSizeWarningLimit: 1000,
    },
    lint: {
      ignorePatterns: [
        "dist/**",
        ".cache/**",
        ".tanstack/**",
        ".vitest/**",
        "test-results/**",
        "playwright-report/**",
        "blob-report/**",
        "src/client/routeTree.gen.ts",
      ],
      options: {
        typeAware: true,
        typeCheck: true,
      },
      categories: {
        correctness: "error",
        suspicious: "error",
        perf: "error",
      },
      plugins: ["react", "unicorn", "typescript", "oxc", "vitest", "promise"],
      rules: {
        "react/react-in-jsx-scope": "off",
      },
    },
    fmt: {
      ignorePatterns: [
        "dist/**",
        ".cache/**",
        ".tanstack/**",
        ".vitest/**",
        "test-results/**",
        "playwright-report/**",
        "blob-report/**",
        "src/client/routeTree.gen.ts",
      ],
      sortPackageJson: true,
    },
    run: {
      cache: {
        scripts: true,
        tasks: true,
      },
    },
    environments: {
      server: {
        build: {
          outDir: "dist/server",
          ssr: true,
          rolldownOptions: {
            input: {
              app: "src/server/app.ts",
            },
          },
        },
      },
    },
    builder: {
      async buildApp(builder) {
        await Promise.all(
          Object.values(builder.environments)
            .filter((environment) => !environment.isBuilt)
            .map((environment) => builder.build(environment)),
        );
      },
    },
    plugins: [
      {
        name: "html-title-sync",
        transformIndexHtml: (html) => html.replace(/%APP_TITLE%/g, APP_TITLE),
      },
      tanstackRouter({
        routesDirectory: "./src/client/routes",
        generatedRouteTree: "./src/client/routeTree.gen.ts",
        autoCodeSplitting: true,
      }),
      react({
        compiler: true,
      }),
      tailwindcss(),
      !isSsrBuild && !isTest && cloudflare(),
    ],
    test: {
      allowOnly: !process.env.CI,
      silent: "passed-only",
      env: {
        DATABASE_URL: "file:./database.test.sqlite",
      },
      globalSetup: ["./test/global-setup.ts"],
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
            fileParallelism: false,
            include: ["test/server/**/*.{test,spec}.ts", "test/canary/**/*.{test,spec}.ts"],
            environment: "node",
            setupFiles: ["./test/server/setup.ts"],
          },
        },
      ],
    },
  };
});
