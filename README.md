# Vite Hono

A modern, zero-magic full-stack web application template built with **Hono**, **Vite**, **React**, **TanStack Router/Query**, and **Drizzle ORM**.

---

## Features

- **End-to-End Type Safety**: Full TypeScript inference across frontend and backend via Hono RPC and Zod—zero schema duplication.
- **Three Clean Deployment Topologies**:
  1. **Fullstack Monolith (Default)**: Single Node / Docker / Cloudflare Worker serving both API and SPA on the same origin (zero CORS).
  2. **Decoupled Fullstack**: Frontend deployed to CDN/Pages, Backend to Node/Worker—still preserving end-to-end Hono RPC type inference!
  3. **Pure Backend (Headless API)**: Standalone API service for external teams or mobile apps via OpenAPI and Scalar.
- **Modern API Reference (Scalar)**: Beautiful, responsive interactive API documentation powered by `@scalar/hono-api-reference` with built-in dark mode and 10+ client code generators.
- **Full-Stack i18n**: Built-in multi-language support (English / Traditional Chinese) across UI components and backend error messages.
- **Convention-Over-Configuration**: Zero bundler black magic, zero runtime flag traps; deployments adapt automatically based on build artifacts.

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
- Scalar API Reference: `http://localhost:3000/openapi`
- OpenAPI JSON Spec: `http://localhost:3000/openapi/doc.json`

---

## OpenAPI & Scalar Documentation

The project includes built-in interactive OpenAPI 3.0 documentation powered by `@hono/zod-openapi` and `@scalar/hono-api-reference`.

### Endpoints

- **Scalar API Reference**: `http://localhost:3000/openapi` (interactive UI, dark mode, client code snippets, search)
- **OpenAPI JSON Spec**: `http://localhost:3000/openapi/doc.json` (for external teams to generate SDKs via `openapi-typescript` / `orval`)

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

---

## Deployment Topologies

### 1. Fullstack Monolithic Deployment (Default)

Build both frontend SPA and backend server into a single Node/Docker container or Cloudflare Worker:

```bash
# Node.js / Docker
npm run build
npm start

# Cloudflare Workers + D1
npm run build
npm run deploy:cf
```

### 2. Decoupled Deployment (Frontend on CDN, Backend on Cloud)

- **Frontend**: Run `npm run build:client` and deploy `dist/client` to Cloudflare Pages, Vercel, or S3.
  - Set `VITE_API_ENDPOINT_RPC="https://api.yourdomain.com/api"`.
  - Frontend continues to use `hc<AppType>` for full end-to-end type safety!
- **Backend**: Run `npm run build:server` and deploy `dist/server` to any Node/Docker host.
  - Set `CORS_ORIGIN="https://your-frontend-domain.com"`.

### 3. Pure Backend (Headless API)

Build only the server without compiling any frontend assets:

```bash
npm run build:server
npm start
```

The server automatically detects that `dist/client/index.html` does not exist and runs as a pure API service responding to `/api` and `/openapi`.

---

## Environment Variables (`.env`)

| Variable         | Default                  | Description                                              |
| :--------------- | :----------------------- | :------------------------------------------------------- |
| `DATABASE_URL`   | `file:./database.sqlite` | SQLite / LibSQL database connection URL (Required)       |
| `COOKIE_SECRET`  | `32+ chars secret`       | Cookie session signing secret (Required in production)   |
| `PORT`           | `3000`                   | Server listening port (Node / Docker)                    |
| `CORS_ORIGIN`    | `*`                      | Allowed CORS origin for decoupled deployments            |
| `ENABLE_OPENAPI` | `1`                      | Enable OpenAPI doc & Scalar UI (`1` = yes, `0` = no)     |
| `VITE_TITLE`     | `Test Vite Hono`         | Application title displayed in browser and API Reference |

---

## Scripts

| Command                | Description                                                      |
| :--------------------- | :--------------------------------------------------------------- |
| `npm run dev`          | Start development server with Vite HMR                           |
| `npm run build`        | Fullstack build: builds both frontend SPA and backend SSR server |
| `npm run build:client` | Frontend-only build: builds `dist/client` SPA                    |
| `npm run build:server` | Backend-only build: builds `dist/server/app.js`                  |
| `npm start`            | Start Node.js production server                                  |
| `npm run deploy:cf`    | Deploy to Cloudflare Workers (`wrangler deploy`)                 |
| `npm run docker:build` | Build Docker image using `engines.node` version                  |
| `npm run docker:up`    | Start Docker Compose                                             |
| `npm run docker:down`  | Stop Docker Compose containers                                   |
| `npm run typecheck`    | Run TypeScript typechecking (`tsc -b`)                           |
| `npm run lint`         | Run Oxlint check                                                 |
| `npm run lint:fix`     | Run Oxlint auto-fix                                              |
| `npm run format`       | Format code with Oxfmt                                           |
| `npm run db:push`      | Push schema changes to database via Drizzle Kit                  |
| `npm run db:seed`      | Seed database with initial data                                  |
| `npm run db:studio`    | Launch Drizzle Studio database UI                                |
| `npm run db:generate`  | Generate migration files with Drizzle Kit                        |
| `npm run db:migrate`   | Apply migrations with Drizzle Kit                                |
