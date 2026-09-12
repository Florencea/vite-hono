import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[-_]([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

const rawName = process.argv[2]?.trim();
if (!rawName) {
  console.error("Error: Please specify a feature name.");
  console.error("Usage: npm run scaffold:feature <feature-name>");
  process.exit(1);
}

const kebabName = toKebabCase(rawName);
const camelName = toCamelCase(rawName);
const pascalName = toPascalCase(rawName);

const rootDir = process.cwd();
const featureDir = path.join(rootDir, "src", "server", "routes", kebabName);
const testFile = path.join(
  rootDir,
  "test",
  "server",
  `${kebabName}-contract.test.ts`,
);
const routerFile = path.join(rootDir, "src", "server", "router.ts");
const schemaLocaleFile = path.join(rootDir, "src", "locales", "schema.ts");
const enLocaleFile = path.join(rootDir, "src", "locales", "en-US.ts");
const zhLocaleFile = path.join(rootDir, "src", "locales", "zh-TW.ts");

if (fs.existsSync(featureDir)) {
  console.error(
    `Error: Feature directory "src/server/routes/${kebabName}" already exists.`,
  );
  process.exit(1);
}

fs.mkdirSync(featureDir, { recursive: true });

// 1. Feature Schema
const schemaContent = `import { z } from "@hono/zod-openapi";

export const Create${pascalName}ReqSchema = z.object({
  title: z.string().min(1).openapi({
    description: "Title of the ${camelName}",
    example: "Sample ${pascalName} Title",
  }),
});

export const ${pascalName}ResSchema = z.object({
  id: z.string().openapi({
    description: "Unique identifier",
    example: "1",
  }),
  title: z.string().openapi({
    description: "Title of the ${camelName}",
    example: "Sample ${pascalName} Title",
  }),
});

export const ${pascalName}ListResSchema = z.object({
  items: z.array(${pascalName}ResSchema).openapi({
    description: "List of ${camelName} items",
  }),
});
`;

fs.writeFileSync(
  path.join(featureDir, `${kebabName}.schema.ts`),
  schemaContent,
  "utf8",
);

// 2. Feature Routes
const routesContent = `import { createRoute } from "@hono/zod-openapi";
import { ErrorResSchema } from "../../common/schemas.ts";
import {
  Create${pascalName}ReqSchema,
  ${pascalName}ListResSchema,
  ${pascalName}ResSchema,
} from "./${kebabName}.schema.ts";

export const list${pascalName}Route = createRoute({
  method: "get",
  path: "/",
  summary: "List all ${kebabName} items",
  description: "Retrieve list of all ${kebabName} entries",
  tags: ["${pascalName}"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ${pascalName}ListResSchema,
        },
      },
      description: "List of ${kebabName} retrieved successfully",
    },
  },
});

export const create${pascalName}Route = createRoute({
  method: "post",
  path: "/",
  summary: "Create a new ${kebabName}",
  description: "Create a new ${kebabName} entry",
  tags: ["${pascalName}"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: Create${pascalName}ReqSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ${pascalName}ResSchema,
        },
      },
      description: "${pascalName} created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResSchema,
        },
      },
      description: "Validation or bad request error",
    },
  },
});
`;

fs.writeFileSync(
  path.join(featureDir, `${kebabName}.routes.ts`),
  routesContent,
  "utf8",
);

// 3. Feature Handlers
const handlersContent = `import type { RouteHandler } from "@hono/zod-openapi";
import type { AppEnv } from "../../common/factory.ts";
import { t } from "../../i18n.ts";
import type {
  create${pascalName}Route,
  list${pascalName}Route,
} from "./${kebabName}.routes.ts";

export const list${pascalName}Handler: RouteHandler<
  typeof list${pascalName}Route,
  AppEnv
> = (c) => {
  return c.json({ items: [] }, 200);
};

export const create${pascalName}Handler: RouteHandler<
  typeof create${pascalName}Route,
  AppEnv
> = (c) => {
  const { title } = c.req.valid("json");
  if (!title.trim()) {
    return c.json({ error: t(c, "errors.${camelName}.invalid") }, 400);
  }

  return c.json({ id: "1", title }, 200);
};
`;

fs.writeFileSync(
  path.join(featureDir, `${kebabName}.handlers.ts`),
  handlersContent,
  "utf8",
);

// 4. Feature Index Sub-Router
const indexContent = `import { createRouter } from "../../common/factory.ts";
import {
  create${pascalName}Handler,
  list${pascalName}Handler,
} from "./${kebabName}.handlers.ts";
import {
  create${pascalName}Route,
  list${pascalName}Route,
} from "./${kebabName}.routes.ts";

export const ${camelName}Router = createRouter()
  .openapi(list${pascalName}Route, list${pascalName}Handler)
  .openapi(create${pascalName}Route, create${pascalName}Handler);

export * from "./${kebabName}.handlers.ts";
export * from "./${kebabName}.routes.ts";
export * from "./${kebabName}.schema.ts";
`;

fs.writeFileSync(path.join(featureDir, "index.ts"), indexContent, "utf8");

// 5. Integration / Contract Test
const testContent = `import { expect, test } from "vitest";
import enUS from "../../src/locales/en-US";
import zhTW from "../../src/locales/zh-TW";
import app from "../../src/server/app";

test("Server Schema Contract: GET /api/${kebabName} returns list schema", async () => {
  const res = await app.request("/api/${kebabName}", {
    method: "GET",
  });
  expect(res.status).toBe(200);
  const json = (await res.json()) as { items: unknown[] };
  expect(Array.isArray(json.items)).toBe(true);
});

test("Server Schema Contract: POST /api/${kebabName} validates payload and creates entry", async () => {
  const res = await app.request("/api/${kebabName}", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Test ${pascalName}" }),
  });
  expect(res.status).toBe(200);
  const json = (await res.json()) as { id: string; title: string };
  expect(json.title).toBe("Test ${pascalName}");
});

test("Server i18n Error Contract: POST /api/${kebabName} returns localized error on empty title", async () => {
  const enRes = await app.request("/api/${kebabName}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "en-US",
    },
    body: JSON.stringify({ title: "   " }),
  });
  expect(enRes.status).toBe(400);
  const enJson = (await enRes.json()) as { error: string };
  expect(enJson.error).toBe(enUS.errors.${camelName}.invalid);

  const zhRes = await app.request("/api/${kebabName}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "zh-TW",
    },
    body: JSON.stringify({ title: "   " }),
  });
  expect(zhRes.status).toBe(400);
  const zhJson = (await zhRes.json()) as { error: string };
  expect(zhJson.error).toBe(zhTW.errors.${camelName}.invalid);
});
`;

fs.writeFileSync(testFile, testContent, "utf8");

// 6. Update router.ts
let routerSrc = fs.readFileSync(routerFile, "utf8");
const importStmt = `import { ${camelName}Router } from "./routes/${kebabName}/index.ts";\n`;
if (!routerSrc.includes(importStmt)) {
  routerSrc = importStmt + routerSrc;
}
routerSrc = routerSrc.replace(
  /export const apiRouter = createRouter\(\)([\s\S]*?);/,
  (_, routes: string) =>
    `export const apiRouter = createRouter()${routes}.route("/${kebabName}", ${camelName}Router);`,
);
fs.writeFileSync(routerFile, routerSrc, "utf8");

// 7. Update Locales Schema
let schemaLocaleSrc = fs.readFileSync(schemaLocaleFile, "utf8");
const schemaLocaleSnippet = `  ${camelName}: {\n    title: string;\n  };\n`;
schemaLocaleSrc = schemaLocaleSrc.replace(
  /export interface LocaleSchema \{([\s\S]*?)errors: \{/,
  (_, p1: string) =>
    `export interface LocaleSchema {${p1}${schemaLocaleSnippet}  errors: {`,
);
const schemaErrorSnippet = `    ${camelName}: {\n      invalid: string;\n      notFound: string;\n    };\n`;
schemaLocaleSrc = schemaLocaleSrc.replace(
  /errors: \{([\s\S]*?)auth: \{/,
  (_, p1: string) => `errors: {${p1}${schemaErrorSnippet}    auth: {`,
);
fs.writeFileSync(schemaLocaleFile, schemaLocaleSrc, "utf8");

// 8. Update en-US.ts
let enLocaleSrc = fs.readFileSync(enLocaleFile, "utf8");
const enLocaleSnippet = `  ${camelName}: {\n    title: "${pascalName}",\n  },\n`;
enLocaleSrc = enLocaleSrc.replace(
  /export default \{([\s\S]*?)errors: \{/,
  (_, p1: string) => `export default {${p1}${enLocaleSnippet}  errors: {`,
);
const enErrorSnippet = `    ${camelName}: {\n      invalid: "Invalid ${kebabName} data provided.",\n      notFound: "${pascalName} not found.",\n    },\n`;
enLocaleSrc = enLocaleSrc.replace(
  /errors: \{([\s\S]*?)auth: \{/,
  (_, p1: string) => `errors: {${p1}${enErrorSnippet}    auth: {`,
);
fs.writeFileSync(enLocaleFile, enLocaleSrc, "utf8");

// 9. Update zh-TW.ts
let zhLocaleSrc = fs.readFileSync(zhLocaleFile, "utf8");
const zhLocaleSnippet = `  ${camelName}: {\n    title: "${pascalName}",\n  },\n`;
zhLocaleSrc = zhLocaleSrc.replace(
  /export default \{([\s\S]*?)errors: \{/,
  (_, p1: string) => `export default {${p1}${zhLocaleSnippet}  errors: {`,
);
const zhErrorSnippet = `    ${camelName}: {\n      invalid: "提供的 ${kebabName} 資料無效。",\n      notFound: "找不到指定的 ${kebabName}。",\n    },\n`;
zhLocaleSrc = zhLocaleSrc.replace(
  /errors: \{([\s\S]*?)auth: \{/,
  (_, p1: string) => `errors: {${p1}${zhErrorSnippet}    auth: {`,
);
fs.writeFileSync(zhLocaleFile, zhLocaleSrc, "utf8");

console.info(`✓ Successfully scaffolded feature "${kebabName}":`);
console.info(
  `  - Route Schema:  src/server/routes/${kebabName}/${kebabName}.schema.ts`,
);
console.info(
  `  - Route Specs:   src/server/routes/${kebabName}/${kebabName}.routes.ts`,
);
console.info(
  `  - Route Handler: src/server/routes/${kebabName}/${kebabName}.handlers.ts`,
);
console.info(`  - Sub-Router:    src/server/routes/${kebabName}/index.ts`);
console.info(`  - Contract Test: test/server/${kebabName}-contract.test.ts`);
console.info(`  - Mounted in:    src/server/router.ts`);
console.info(`  - Localized in:  src/locales/schema.ts, en-US.ts, zh-TW.ts`);
console.info(
  `Run "npm run check:fast" to verify the newly scaffolded feature.`,
);
