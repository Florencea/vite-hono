# Vite Hono

A modern full-stack web application template built with **Hono**, **Vite**, **React**, **TanStack Router/Query**, and **Drizzle ORM**.

---

## Features

- **End-to-End Type Safety**: Full TypeScript inference across frontend and backend via Hono RPC and Zod—zero schema duplication.
- **Full-Stack i18n**: Built-in multi-language support (English / Traditional Chinese) across UI components and backend error messages.
- **Auto OpenAPI & Typegen**: Interactive Swagger UI with instant client code generation (TypeScript, Java, C#) from API routes.
- **Solo-Developer Friendly**: Rapid development loop for ERP and internal tools with Vite HMR, TanStack Router/Query, and Ant Design.
- **Flexible Zero-Lock-in Deployment**: Switch between local SQLite, Docker, or Cloudflare Workers + D1 via single `.env` settings.

---

## Quick Start

### 1. Installation & Setup

```bash
# Install dependencies
npm ci

# Copy environment variables
cp .env.example .env

# Initialize database
npm run db:push
npm run db:seed
```

Default credentials: `admin` / `string` (configurable in `src/server/database/seed.ts`).

### 2. Development

```bash
npm run dev
```

- Web App: `http://localhost:3000/`
- Swagger UI: `http://localhost:3000/openapi/`

---

## OpenAPI & Swagger Documentation

The project includes built-in interactive OpenAPI (Swagger UI) and client type generation powered by `@hono/zod-openapi` and `quicktype-core`.

### Endpoints

- **Swagger UI**: `http://localhost:3000/openapi/` (visual documentation and API testing)
- **OpenAPI JSON Spec**: `http://localhost:3000/openapi/doc.json`
- **Typegen API**: `http://localhost:3000/openapi/typegen/:lang` (supports `typescript`, `java`, `csharp`)

### Defining OpenAPI Routes

Define API routes using `createRoute` from `@hono/zod-openapi`:

```ts
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const router = new OpenAPIHono();

const helloRoute = createRoute({
  method: "get",
  path: "/hello",
  tags: ["Greeting"],
  summary: "Say hello",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "Successful greeting response",
    },
  },
});

router.openapi(helloRoute, (c) => {
  return c.json({ message: "Hello World" });
});
```

### Customizing Swagger UI & Documentation

- **Module location**: `src/server/openapi/`
- **API Description**: Edit `src/server/openapi/description.md` (Markdown format, supports linting and preview).
- **Custom Styles & Fonts**: Tweak `src/server/openapi/assets/custom.css`, `theme.css`, and `cookie.css` (real CSS files formatted with `oxfmt`).
- **Client Interactions**: Adjust clipboard copy, highlighting, and typegen behaviors in `src/server/openapi/assets/custom.js` (real JS file checked by `oxlint`).
- **Toggle OpenAPI**: Set `ENABLE_OPENAPI=0` in `.env` to completely disable OpenAPI routes without impacting the client bundle.

---

## Environment Variables (`.env`)

| Variable                     | Default                  | Description                                                            |
| :--------------------------- | :----------------------- | :--------------------------------------------------------------------- |
| `VITE_TITLE`                 | `Test Vite Hono`         | Application title shown in browser and OpenAPI doc                     |
| `VITE_WEB_BASE`              | `/`                      | Base URL path for web routing and assets                               |
| `VITE_API_OPENAPI_DOC_ROUTE` | `/openapi`               | OpenAPI documentation route path                                       |
| `VITE_API_ENDPOINT_RPC`      | `/api`                   | Hono RPC endpoint route path                                           |
| `VITE_OUTDIR`                | `dist`                   | Production build output directory                                      |
| `ENABLE_CLIENT`              | `1`                      | Enable frontend SPA hosting (`1` = yes, `0` = no)                      |
| `ENABLE_SERVER`              | `1`                      | Enable backend API server (`1` = yes, `0` = no)                        |
| `ENABLE_OPENAPI`             | `1`                      | Enable OpenAPI doc and Swagger UI (`/openapi`)                         |
| `ENABLE_TYPEGEN`             | `1`                      | Enable typegen route (`/openapi/typegen`)                              |
| `ENABLE_COMPRESSION`         | `1`                      | Enable HTTP compression (`hono/compress`)                              |
| `PORT`                       | `3000`                   | Server listening port (Node / Docker)                                  |
| `CORS_ORIGIN`                | `*`                      | Allowed CORS origin (use specific origin when credentials are enabled) |
| `DATABASE_URL`               | `file:./database.sqlite` | SQLite / LibSQL connection URL                                         |
| `COOKIE_NAME`                | `TestViteHono`           | Session cookie name                                                    |
| `COOKIE_SECRET`              | 32+ chars secret         | Cookie encryption & signing secret                                     |
| `SESSION_TTL`                | `604800`                 | Session TTL in seconds (7 days)                                        |

---

## Deployment

### 1. Node.js Server

```bash
npm run build
npm start
```

### 2. Docker Container

Build and run using `package.json` `engines.node` as the single source of truth:

```bash
# Start container with Docker Compose (auto-injects engines.node)
npm run docker:up

# Stop container
npm run docker:down

# Or build Docker image directly
npm run docker:build
```

### 3. Cloudflare Workers + D1

```bash
# 1. Login and create D1 database
npx wrangler login
npx wrangler d1 create vite-hono-db

# 2. Update database_id in wrangler.jsonc and set session secret
npx wrangler secret put COOKIE_SECRET

# 3. Build client assets and deploy to Cloudflare Workers
npm run build
npm run deploy:cf
```

---

## Scripts

| Command                | Description                                              |
| :--------------------- | :------------------------------------------------------- |
| `npm run dev`          | Start development server with HMR                        |
| `npm run build`        | Build client and server for production with Vite         |
| `npm start`            | Start Node.js production server                          |
| `npm run preview`      | Preview production server locally (requires build first) |
| `npm run deploy:cf`    | Deploy to Cloudflare Workers (`wrangler deploy`)         |
| `npm run docker:build` | Build Docker image using `engines.node` version          |
| `npm run docker:up`    | Start Docker Compose with `engines.node` version         |
| `npm run docker:down`  | Stop Docker Compose containers                           |
| `npm run typecheck`    | Run TypeScript typechecking (`tsc -b`)                   |
| `npm run lint`         | Run Oxlint check                                         |
| `npm run lint:fix`     | Run Oxlint auto-fix                                      |
| `npm run format`       | Format code with Oxfmt                                   |
| `npm run db:push`      | Push schema changes to database via Drizzle Kit          |
| `npm run db:seed`      | Seed database with initial data                          |
| `npm run db:studio`    | Launch Drizzle Studio database UI                        |
| `npm run db:generate`  | Generate migration files with Drizzle Kit                |
| `npm run db:migrate`   | Apply migrations with Drizzle Kit                        |
