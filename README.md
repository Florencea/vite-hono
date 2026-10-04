# vite-hono

Enterprise-grade, full-stack web template combining **Hono** backend and **React 19 + Ant Design 6** frontend into a single type-safe codebase, powered by **Vite+** (`vp`).

---

## Highlights

- **Vite+ (`vp`) Unified Toolchain**: Sub-second static checks with Oxlint (`vp lint`), Oxfmt (`vp fmt`), and integrated Vitest 5 (`vp test`).
- **End-to-End Type Safety**: Server schemas (`@hono/zod-openapi`) infer client RPC (`hc<AppType>`), TanStack Router, and Ant Design forms (`useAntdForm`) without manual interfaces.
- **Strict Single Source of Truth (SSOT)**:
  - **Tokens**: TailwindCSS v4 `@theme` bridged into Ant Design v6 theme variables.
  - **Database**: Drizzle ORM schema with code-first schema push (`vpr db:push`) and automatic dual-target database seeding (`vpr db:seed`).
  - **i18n**: Type-safe isomorphic translations (`LocaleSchema`) with recursive parity contract tests between `en-US` and `zh-TW`.
- **RBAC & Zero Unprotected Routes**: Fail-closed gatekeeper ensuring every route declares permissions, authentication, or explicit public access.
- **Dual-Track Testing**: Vitest browser mode running in headless Chromium (`@vitest/browser-playwright`) for UI flows, and in-memory Hono (`app.request()`) for server contract tests.
- **Strict Quality Gate**: Unified verification (`vpr check` or `vp check`) enforcing strict TypeScript, Oxlint, Tailwind CSS v4 canonical classes, Knip dead-code detection, dual-track testing, and dual-bundle builds.

---

## Quick Start

### 1. Setup & Database

```bash
# Install dependencies via Vite+
vp install

# Push schema and seed initial data
vpr db:push
vpr db:seed
```

> **Database SSOT**: `src/server/database/schema.ts` serves as the single source of truth for database tables. The project follows a code-first schema push workflow (`vpr db:push`), and `vpr db:seed` automatically seeds both the primary database (`database.sqlite`) and local Cloudflare D1 (`.wrangler/state/v3/d1/`).

### 2. Run Development Server

```bash
vp dev
```

- Web App: `http://localhost:5173/` (native Vite dev server with Cloudflare Workers emulation)
- Scalar API Reference: `http://localhost:5173/openapi`
- OpenAPI JSON Spec: `http://localhost:5173/openapi/doc.json`

For Node.js production runner, start with `vpr start` (listening on `PORT`, default `3000`).

---

## Feature Development Workflow

This template follows an **End-to-End Type-Safe & Test-Driven (TDD)** development flow:

1. **Scaffold Feature Slice**:
   - Run `vpr scaffold:feature <feature-name>` to bootstrap schema, routes, handlers, and contract tests.
2. **Implement Business Logic**:
   - Connect handlers and database models in `src/server/routes/<feature>/`.
3. **Client UI & Form**:
   - Create routes in `src/client/routes/` and components in `src/client/components/`.
   - Bind forms to RPC types via `useAntdForm<RouterInputs["<feature>"]>()`.
4. **Browser Mode Test**:
   - Write real browser tests in `test/client/` using `renderAppAt()` to verify UI interactions, token styles, and RPC calls.
5. **Unified Verification Gate**:
   - Execute `vpr check` to verify types, lints, formatting, dead code, tests, and build.

---

## Verification Gate (Definition of Done)

Run the unified gate before committing or completing development tasks:

```bash
vpr check
```

Executes `vp check` (Oxlint + Oxfmt + typecheck) + `lint:tailwind` + `check:deadcode` (Knip) + `test` (Vitest dual-track: Chromium + Node) + `build`. Must pass with 0 errors and 0 warnings.

---

## Available Scripts

| Command                  | Description                                                                                               |
| :----------------------- | :-------------------------------------------------------------------------------------------------------- |
| `vp dev`                 | Start native Vite dev server (with `@cloudflare/vite-plugin` emulation)                                   |
| `vp preview`             | Preview production build locally via Vite                                                                 |
| `vp check`               | Run Oxlint, Oxfmt, and TypeScript checks                                                                  |
| `vpr check`              | Run unified verification gate (checks, deadcode, tests, build)                                            |
| `vpr check:fast`         | Fast feedback loop (`typecheck` + `lint` + server unit tests)                                             |
| `vpr agent:verify:inner` | Agent fail-fast static verification (`typecheck` + `lint`)                                                |
| `vpr agent:verify:unit`  | Agent unit verification (`inner` + server unit tests)                                                     |
| `vpr agent:verify:gate`  | Agent comprehensive gate (`unit` + `build` + client E2E tests)                                            |
| `vpr agent:typecheck`    | TypeScript strict type check with raw output                                                              |
| `vpr agent:lint`         | Oxlint and Tailwind class verification with zero warnings tolerance                                       |
| `vpr agent:test:unit`    | Server in-memory unit tests in flat TAP format                                                            |
| `vpr agent:test:e2e`     | Client browser E2E tests in headless Chromium in flat TAP format                                          |
| `vp test`                | Run all Vitest tests (client + server)                                                                    |
| `vpr test:setup`         | Install Playwright Chromium binary                                                                        |
| `vp build`               | Build client SPA (`dist/client`), server bundle (`dist/server`), and Cloudflare Worker (`dist/vite_hono`) |
| `vpr start`              | Start Node.js production server (`node dist/server/app.js`)                                               |
| `vpr lint:tailwind`      | Check Tailwind CSS v4 canonical class syntax                                                              |
| `vpr lint:tailwind:fix`  | Automatically format Tailwind CSS v4 canonical classes                                                    |
| `vpr check:deadcode`     | Audit unused code and dependencies with Knip                                                              |
| `vpr db:push`            | Push schema changes via Drizzle Kit                                                                       |
| `vpr db:seed`            | Seed database with initial data                                                                           |
| `vpr db:studio`          | Launch Drizzle Studio database manager                                                                    |
| `vpr deploy:cf`          | Deploy to Cloudflare Workers                                                                              |
| `vpr docker:build`       | Build Docker image with dynamic `engines.node` injection                                                  |

---

## Guidelines

For architectural rules, SSOT conventions, and strict coding standards, see [AGENTS.md](AGENTS.md).
