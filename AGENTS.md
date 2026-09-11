# Agent Development Guidelines

Guidelines for AI agents and developers working on this repository.

## 1. Architectural Conventions

- **Frontend (`src/client/`)**:
  - **Routes**: Modular routes in `src/client/routes/`. Never edit `src/client/routeTree.gen.ts` (auto-generated).
  - **Components**: Reusable UI elements in `src/client/components/`.
  - **React Compiler**: Automatic fine-grained memoization is enabled via `@vitejs/plugin-react` (`reactCompilerPreset`) and `@rolldown/plugin-babel`. Do not write manual `useMemo`, `useCallback`, or `React.memo` unless handling non-compiler edge cases. Conforms strictly to `eslint-plugin-react-hooks`'s `recommended-latest` rules.
- **Backend (`src/server/`)**:
  - **Routes**: Modular OpenAPI handlers in `src/server/routes/`.
  - **Database & Seeding SSOT**:
    - `src/server/database/schema.ts`: Single Source of Truth (SSOT) for all database tables and relations.
    - `src/server/database/seed.ts`: SSOT for seed data (`DEFAULT_ADMIN`) and schema verification (`seedDatabase()`). Automatically seeds both primary database (`database.sqlite`) and local Cloudflare D1 (`.wrangler/state/v3/d1/*.sqlite`).
    - **Code-First Schema Push**: The project follows a code-first workflow (`npm run db:push`, `npm run db:seed`). The `drizzle/` migrations directory is excluded in `.gitignore` to prevent committing generated SQL snapshots.
  - **Dual-Track Architecture**:
    - `src/server/core.ts`: Single Source of Truth (SSOT) containing all middleware, OpenAPI setup, and route mounting. NEVER contains DDL or database seeding logic.
    - `src/server/worker.ts`: Cloudflare Workers & local dev/preview entry point via `@cloudflare/vite-plugin`.
    - `src/server/app.ts`: Dedicated Node.js, Bare-Metal, and Docker production runner via `@hono/node-server`.
  - **Authentication & Security**:
    - Uses pure-TypeScript, zero-dependency `bcrypt-ts` (`hash`, `compare`) in `src/server/auth.ts` for universal runtime compatibility across Node.js 24, Docker, and Cloudflare Workers isolates (`workerd`).
    - Do NOT use native C++ `bcrypt` (fails in Cloudflare Workers) or `hash-wasm` (violates Cloudflare Workers dynamic WebAssembly compilation security restrictions).
- **Styling & SSOT**:
  - **Single Source of Truth**: TailwindCSS v4 `@theme` in `src/client/global.css` defines all tokens.
  - **Token Bridge**: `src/client/theme.ts` dynamically extracts CSS variables into Ant Design tokens. Never hardcode fallback colors.
  - **No Inline `style`**: Prefer Ant Design layout components (`Layout`, `Flex`, `Space`, `Row`, `Col`, `Card`).
  - **No `!` (important)**: Tailwind is scoped under `#root` with natural specificity over Ant Design.
  - **Canonical Classes**: Use Tailwind CSS v4 canonical class syntax (e.g. `bg-(--variable)` instead of `bg-[var(--variable)]`). Run `npm run lint:tailwind` to diagnose non-canonical classes and `npm run lint:tailwind:fix` to automatically format them.
- **Language & i18n**:
  - **Pure TypeScript Schema SSOT**: `src/locales/schema.ts` defines `LocaleSchema` and `TranslationKey`.
  - **Strict Language Parity**: Every supported language (`en-US`, `zh-TW`, and future languages) in `src/locales/` MUST implement `satisfies LocaleSchema`.
  - **Central Registry**: `src/locales/registry.ts` manages supported locales and bridges Day.js and Ant Design locales without server bundling bloat.
  - **Isomorphic Translation API**: Client uses `useI18n()` (`useTranslation`), server uses `t(c, key)` from `src/server/i18n.ts`.
  - Keep code comments in concise English.

## 2. Strict Coding Standards

- **No `any`**: Always provide explicit TypeScript types or generics.
- **No `@ts-ignore`**: Use `@ts-expect-error` with a descriptive reason only if strictly unavoidable.
- **No Floating Promises**: Always `await` or properly handle Promises.
- **No Dead Code**: Do not export unused types/functions or leave unused dependencies. Knip checks this.
- **No Linter Workarounds**: Never weaken `eslint.config.ts`. Fix code directly to satisfy strict rules.
- **Modern & Idiomatic TypeScript**:
  - Write concise, idiomatic TypeScript and avoid redundant defensive wrappers (e.g. do NOT use `.filter(Boolean)` in Vite `plugins` array since Vite natively filters falsy plugin entries).
  - Use modern syntax features: object property shorthands (`{ routeTree }`), interface extension (`interface B extends A`), and clean fallback operators (`||`, `??=`).
  - Use `Boolean(x)` instead of `!!x` for clarity where explicit booleans are required.
  - Trust React Compiler for automatic memoization: never add manual `useMemo` or `useCallback` without an explicit, documented edge-case rationale.
  - **Robust Configuration**: Keep `src/server/config.ts` lean and purposeful. Never wrap fixed architectural constants (e.g. `/api`, `/openapi`, `dist/client`) in pseudo-environment variables (`process.env.VITE_*`). Reserve `process.env` exclusively for genuine runtime settings (e.g. `PORT`, `DATABASE_URL`, `COOKIE_SECRET`, `CORS_ORIGIN`, `ENABLE_OPENAPI`) with strict fail-fast validation (`validateConfig()`) rather than silent default fallbacks.
- **Explicit String Conversions**: Call `.toString()` on numbers in template literals.
- **Zero Key Drift & Complete i18n**:
  - Never hardcode user-facing copy or API error messages.
  - When creating or modifying screens or APIs, define keys in `src/locales/schema.ts` and implement them across ALL supported language files (`en-US.ts`, `zh-TW.ts`, etc.).
  - Backend errors (including 400, 401, 403, 404, 500) must return localized error messages using `t(c, "errors.<domain>.<code">)`.
  - All language files must satisfy `LocaleSchema` so missing keys cause compile-time failures during `tsc -b`.

## 3. Testing Standards

- **Dual-Track Testing Architecture**:
  - **Client (`test:client`)**: Runs inside headless Chromium (`@vitest/browser-playwright`). Use `renderAppAt(initialUrl)` from `test/client/test-utils.tsx` to mount routes with complete `<Providers>` context.
  - **Server (`test:server`)**: Runs in Node.js environment. Leverage Hono's native `app.request()` for in-memory HTTP/RPC and schema verification without network port conflicts.
- **End-to-End Type Safety**:
  - Ensure server Zod schemas (`@hono/zod-openapi`) stay in sync with client RPC (`hc<AppType>`), `RouterInputs`, and Ant Design forms (`useAntdForm`).
  - Use `expectTypeOf` to guard static contracts in `test/canary/e2e-type-contract.test.ts`.
- **i18n Schema Parity & Contract Testing**:
  - Guard zero key drift with recursive key completeness assertions in `test/canary/i18n-contract.test.ts`.
  - Assert that server error responses dynamically resolve translations according to `Accept-Language` headers.
- **Selector Standards**:
  - Prefer accessible queries (`screen.getByRole`, `screen.getByLabelText`) or explicit `data-testid`.
  - Never query by volatile CSS classes (such as `.ant-btn-primary`).
- **Assertion Rigor**:
  - For browser UI elements, assert both DOM presence and visibility:
    - `await expect.element(el).toBeInTheDocument()`
    - `await expect.element(el).toBeVisible()`

## 4. Feature Development Workflow (Agent-First TDD)

When implementing a new feature or API, follow this end-to-end type-safe flow:

1. **Backend Schema & i18n First (`src/server/routes/<feature>/` & `src/locales/`)**:
   - Define request/response Zod schemas with `@hono/zod-openapi` in `<feature>.schema.ts`.
   - Register route specification using `createRoute()` in `<feature>.routes.ts`.
   - If feature defines error responses, add corresponding keys to `src/locales/schema.ts` and populate all dictionaries.
2. **Server Handler & In-Memory Test (`test/server/`)**:
   - Implement route handlers in `<feature>.handlers.ts` using `t(c, "errors...")` for error states, and export the sub-router in `<feature>/index.ts`.
   - Write in-memory HTTP integration tests using Hono's `app.request()` in `test/server/` to verify schemas, status codes, localized errors, and edge cases.
3. **Expose RPC Route (`src/server/router.ts`)**:
   - Mount the sub-router into `apiRouter`. Hono RPC types (`AppType`, `api.<feature>`) infer automatically for client consumption.
4. **Client UI, Form & i18n (`src/client/`)**:
   - Define type aliases using `InferRequestType<typeof api.<feature>...>` in `src/client/constants/routes.tsx` (`RouterInputs`).
   - Add UI copy keys to `src/locales/schema.ts` and all language files.
   - Connect Ant Design forms with `useAntdForm<RouterInputs["<feature>"]>()` and `useI18n()`.
   - Build UI components (`src/client/components/`) and TanStack Router pages (`src/client/routes/`).
5. **Browser Mode Test (`test/client/`)**:
   - Write UI and RPC wire contract tests under `test/client/` using `renderAppAt()`.
   - Assert accessible selectors (`getByRole`, `getByTestId`), token bridge styling, and typed RPC payload dispatches.
6. **Pass Unified Verification Gate**:
   - Run `npm run check` and ensure 0 errors and 0 warnings.

## 5. Verification Gate (Definition of Done)

Before completing any task or commit, execute the unified verification gate:

```bash
npm run check
```

Runs:

1. `typecheck` (`tsc -b` in strict mode)
2. `lint` (ESLint strict + stylistic type checks)
3. `lint:tailwind` (Official Tailwind CSS v4 canonical class check via `@tailwindcss/oxide`)
4. `format:check` (Prettier style check)
5. `check:deadcode` (Knip zero-config dead-code audit)
6. `test` (Vitest dual-track tests: client browser + server in-memory)
7. `build` (Client SPA + SSR server build)

All checks must pass with 0 errors and 0 warnings.
