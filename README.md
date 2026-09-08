# Vite Hono

A modern, end-to-end type-safe full-stack template powered by **React 19**, **Vite**, **Hono**, **Ant Design v6**, **TailwindCSS v4**, **TanStack Router / Query**, and **Drizzle ORM**.

Designed for robust full-stack development with deterministic quality gates, zero runtime black magic, and clear architectural conventions.

---

## Highlights

- **Strict Quality Gate**: Single unified command (`npm run check`) enforcing strict TypeScript, ESLint 10, Prettier, Knip dead-code detection, and dual-bundle builds.
- **End-to-End Type Safety**: Shared schema validation and RPC inference via Hono RPC (`hc<AppType>`) and Zod OpenAPI—zero manual SDK generation or contract drift.
- **Tailwind v4 & Ant Design SSOT**: Design tokens declared in `src/client/global.css` (`@theme`) dynamically bridge into Ant Design tokens without hardcoded fallbacks or `!important` hacks.
- **Flexible Topologies**: Run as a single fullstack monolith (Node.js / Docker / Cloudflare Workers), decoupled SPA + API, or headless API microservice.
- **Interactive OpenAPI & Scalar**: Auto-generated interactive API reference with dark mode and multi-language client code snippets at `/openapi`.
- **Full-Stack i18n**: Out-of-the-box internationalization (`en-US` and `zh-TW`) across UI components and API error responses.

---

## Tech Stack

| Layer               | Technology                                       |
| :------------------ | :----------------------------------------------- |
| **Frontend**        | React 19, Vite, Ant Design v6, TailwindCSS v4    |
| **Routing & State** | TanStack Router (file-based), TanStack Query     |
| **Backend & API**   | Hono, Hono RPC, `@hono/zod-openapi`, Scalar      |
| **Database & ORM**  | Drizzle ORM, SQLite / LibSQL / Cloudflare D1     |
| **Code Quality**    | TypeScript (strict), ESLint 10, Prettier 3, Knip |

---

## Quick Start

### 1. Setup & Database

```bash
# Install dependencies
npm ci

# Copy environment variables
cp .env.example .env

# Push schema and seed initial data (admin / string)
npm run db:push
npm run db:seed
```

### 2. Run Development Server

```bash
npm run dev
```

- Web App: `http://localhost:3000/`
- Scalar API Reference: `http://localhost:3000/openapi`
- OpenAPI JSON Spec: `http://localhost:3000/openapi/doc.json`

---

## Verification Gate (Definition of Done)

Run the unified gate before committing or completing development tasks:

```bash
npm run check
```

Executes `typecheck` + `lint` + `format:check` + `check:deadcode` (Knip) + `build`. Must pass with 0 errors and 0 warnings.

---

## Deployment Topologies

1. **Fullstack Monolith (Default)**: Single Node / Docker / Cloudflare Worker serving both API and SPA on the same origin (zero CORS).
   ```bash
   npm run build && npm start
   ```
2. **Decoupled**: Build client (`npm run build:client`) for CDN / Pages and server (`npm run build:server`) for any Node / Cloudflare runtime with full RPC typing.
3. **Headless API**: Build server only (`npm run build:server`). The server automatically serves as a standalone API when client assets are omitted.

---

## Available Scripts

| Command             | Description                              |
| :------------------ | :--------------------------------------- |
| `npm run dev`       | Start development server with Vite HMR   |
| `npm run check`     | Run full 5-step verification gate        |
| `npm run build`     | Build both client SPA and server bundles |
| `npm start`         | Start Node.js production server          |
| `npm run db:push`   | Push schema changes via Drizzle Kit      |
| `npm run db:seed`   | Seed database with initial data          |
| `npm run db:studio` | Launch Drizzle Studio database manager   |
| `npm run deploy:cf` | Deploy to Cloudflare Workers             |

---

## Guidelines

For architectural rules, SSOT conventions, and strict coding standards, see [AGENTS.md](AGENTS.md).

---

## License

[MIT](LICENSE)
