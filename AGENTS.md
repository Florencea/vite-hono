# Agent Development Guidelines

Guidelines for AI agents and developers working on this repository.

### Quick Architecture Map

| Layer                 | Path                                           | Responsibility                                                                |
| :-------------------- | :--------------------------------------------- | :---------------------------------------------------------------------------- |
| **Frontend Routes**   | `src/client/routes/`                           | TanStack file-based routes (run `npm run routes:generate` to regenerate tree) |
| **Frontend UI**       | `src/client/components/`                       | Ant Design + Tailwind CSS v4 components                                       |
| **Theme & Tokens**    | `src/client/global.css`, `src/client/theme.ts` | SSOT Tailwind `@theme` bridged into Antd tokens                               |
| **Translations**      | `src/locales/`                                 | `schema.ts` (SSOT), `en-US.ts`, `zh-TW.ts` (strict parity)                    |
| **Backend Routes**    | `src/server/routes/`                           | Modular OpenAPI schemas, route specs, handlers                                |
| **API Router**        | `src/server/router.ts`                         | Sub-router mounts & RPC `AppType` inference                                   |
| **Database Schema**   | `src/server/database/schema.ts`                | Single Source of Truth (SSOT) for tables and relations                        |
| **Database Seed**     | `src/server/database/seed.ts`                  | Dynamic schema DDL sync (`syncDatabaseSchema`) & seed                         |
| **Testing**           | `test/`                                        | Vitest browser (`test/client`) & in-memory (`test/server`, `test/canary`)     |
| **Tooling & Scripts** | `scripts/`                                     | `scaffold-feature.ts`, `generate-routes.ts`, `lint-tailwind.ts`               |

## 1. Architectural Conventions

- **Frontend (`src/client/`)**:
  - **Routes**: Modular routes in `src/client/routes/`. Never manually edit `src/client/routeTree.gen.ts`. Run `npm run routes:generate` whenever you add, rename, or delete routes.
  - **Components & Reusability**:
    - **Single Source of Truth (SSOT) Types**: Derive all client domain and API types directly from backend Hono RPC definitions (`InferRequestType`, `InferResponseType` in `src/client/types/api.ts`) using `Pick<>` and `Omit<>`. Never handwrite duplicate interface contracts.
    - **Ant Design Props Extension**: Component props must derive directly from Ant Design's standard types (`TableProps`, `ModalProps`, `DrawerProps`, `ButtonProps`) using `Pick`, `Omit`, or `extends` to ensure resilience against upstream library updates.
    - **Core Component Encapsulation**: Prefer composing from reusable core wrappers:
      - `<DataTable>`: Standardizes responsive scrolling (`max-content`), default `rowKey="id"`, and clean layout defaults.
      - `<DataModal>`: Enforces Ant Design 6 `destroyOnHidden` lifecycle and dialog modal defaults.
      - `<PermissionButton>`: Seamlessly encapsulates RBAC permission checks (`permission`, `permissionMode="hide" | "disable"`) directly with Ant Design's `Button`.
    - **Standardized Forms with `useAntdForm`**: Use `useAntdForm` for all Ant Design forms to standardize form instance binding, layout props, and typed field rules across the application.
    - **Headless Feature Hook & Presenter Decoupling**:
      - **Headless Hook (`src/client/hooks/use<Feature>.ts`)**: Encapsulates all data fetching (`useQuery`), RPC mutations (`useMutation`), cache invalidation (`invalidateQueries`), feedback toasts, dialog/selection state, and form configuration (`useAntdForm`).
      - **Pure Presentational Views (`src/client/routes/` & `src/client/components/<feature>/`)**: Views must remain purely presentational. NEVER write inline `useMutation`, raw `api` fetch calls, or side-effectful state logic directly in presentational components. Consume the feature hook and bind to core wrappers (`DataTable`, `DataModal`, `PermissionButton`).
    - **No Unnecessary Effects ("You Might Not Need an Effect")**: Never use `useEffect` to synchronize props to form states (e.g. `form.setFieldsValue`). Follow the official React documentation by passing a declarative `key={record?.id ?? 'new'}` and `initialValues` to the `<Form>`.
  - **React Compiler**: Automatic fine-grained memoization is enabled via `@vitejs/plugin-react` (`reactCompilerPreset`) and `@rolldown/plugin-babel`. Do not write manual `useMemo`, `useCallback`, or `React.memo` unless handling non-compiler edge cases. Conforms strictly to `eslint-plugin-react-hooks`'s `recommended-latest` rules.
- **Backend (`src/server/`)**:
  - **Routes**: Modular OpenAPI handlers in `src/server/routes/`.
  - **Database & Seeding SSOT**:
    - `src/server/database/schema.ts`: Single Source of Truth (SSOT) for all database tables and relations.
    - `src/server/database/seed.ts`: SSOT for seed data (`DEFAULT_ADMIN`) and dynamic schema verification (`syncDatabaseSchema()`, `seedDatabase()`). Dynamically derives table DDL from `schema.ts` without hardcoded SQL statements. Automatically seeds both primary database (`database.sqlite`) and local Cloudflare D1 (`.wrangler/state/v3/d1/*.sqlite`).
    - **Test Database Isolation**: All automated tests run against an isolated ephemeral database (`database.test.sqlite`) that is automatically cleaned on teardown, preventing mutation of the local development database.
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
- **Mandatory RBAC & Fail-Closed Gate**:
  - **Zero Unprotected Routes**: Every newly introduced route (API & UI) MUST have explicit access control. Never expose raw, unguarded endpoints. Unprotected routes will fail the Canary Contract Test (`test/canary/rbac-contract.test.ts`).
  - **Clarification Protocol**: When asked to create a new page, feature, or API, if the user did not explicitly specify permission codes or Data Scope, the Agent MUST:
    1. Ask the user to define the permission codes (e.g. `<domain>:<resource>:<action>`) and data scope (`ALL`, `DEPT_AND_CHILD`, `DEPT`, `SELF`, `CUSTOM`).
    2. If developing autonomously or unprompted, apply the Least Privilege Principle (`default-deny` / restricted to `super_admin` with `SELF` scope).
  - **Route Security Declarations**: Every API route specification in `createRoute` must declare `middleware: [requirePermission("...")]`, `middleware: [authenticatedRoute()]`, or explicitly `middleware: [publicRoute()]`.

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
- **Business Process E2E Testing (`test:client`)**:
  - Every UI feature and CRUD screen MUST have a corresponding browser E2E test file (`test/client/e2e-<feature>.test.tsx`) running in headless Chromium with `@vitest/browser-playwright`.
  - Must test complete real-world user journeys:
    - Table initial render, column headers, and hierarchical/tag display.
    - Create modal/drawer opening, filling form fields, and asserting typed RPC `POST` wire payloads.
    - Edit modal pre-filling, updating fields, and asserting typed RPC `PUT` wire payloads.
    - Delete action triggering Ant Design `Popconfirm`, user confirmation, and asserting typed RPC `DELETE` wire requests.
    - Success feedback toasts, query cache invalidations, and dialog closures.
- **Selector Standards**:
  - Prefer accessible queries (`screen.getByRole`, `screen.getByLabelText`) or explicit `data-testid`.
  - Never query by volatile CSS classes (such as `.ant-btn-primary`).
- **Assertion Rigor**:
  - For browser UI elements, assert both DOM presence and visibility:
    - `await expect.element(el).toBeInTheDocument()`
    - `await expect.element(el).toBeVisible()`

## 4. Feature Development Workflow (Agent-First TDD)

When implementing a new feature or API, follow this end-to-end type-safe flow:

> [!TIP]
> **Rapid Agent Scaffolding**: You can bootstrap the entire backend slice, tests, and i18n keys in seconds:
>
> ```bash
> npm run scaffold:feature <feature-name>
> ```
>
> This creates compliant route schemas, routes, handlers, sub-router, contract tests, and registers the feature in `router.ts` and `locales/` with zero key drift.

1. **Backend Schema & i18n First (`src/server/routes/<feature>/` & `src/locales/`)**:
   - Define request/response Zod schemas with `@hono/zod-openapi` in `<feature>.schema.ts`.
   - Register route specification using `createRoute()` in `<feature>.routes.ts`.
   - If feature defines error responses, add corresponding keys to `src/locales/schema.ts` and populate all dictionaries.
2. **Server Handler & In-Memory Test (`test/server/`)**:
   - Implement route handlers in `<feature>.handlers.ts` using `t(c, "errors...")` for error states, and export the sub-router in `<feature>/index.ts`.
   - Write in-memory HTTP integration tests using Hono's `app.request()` in `test/server/` to verify schemas, status codes, localized errors, and edge cases.
3. **Expose RPC Route (`src/server/router.ts`)**:
   - Mount the sub-router into `apiRouter`. Hono RPC types (`AppType`, `api.<feature>`) infer automatically for client consumption.
4. **Client SSOT Types, Headless Hook & Presentational UI (`src/client/`)**:
   - **SSOT Types**: Derive types using `InferRequestType` and `InferResponseType` in `src/client/types/api.ts` with `Pick<>` and `Omit<>`.
   - **Headless Feature Hook (`src/client/hooks/use<Feature>.ts`)**: Encapsulate all queries, mutations, cache invalidations, feedback toasts, dialog state, and `useAntdForm`.
   - **Presentational UI & Routes (`src/client/components/<feature>/` & `src/client/routes/`)**: Build pure presentational components and routes consuming the hook, composed from `<DataTable>`, `<DataModal>`, and `<PermissionButton>`.
   - Add UI copy keys to `src/locales/schema.ts` and all language files.
   - Run `npm run routes:generate` to regenerate route tree types.
5. **Browser Mode Business Flow E2E Test (`test/client/`)**:
   - Write comprehensive business flow E2E tests under `test/client/e2e-<feature>.test.tsx` using `renderAppAt()`.
   - Test complete CRUD journeys (Create, Read, Update, Delete with Popconfirm), accessible form selectors, and typed RPC wire contracts.
6. **Pass Verification Gates**:
   - For fast inner-loop iteration: `npm run check:fast`
   - For final verification: `npm run check`

## 5. Verification Gate (Definition of Done)

The project employs a two-tier verification gate strategy for optimal developer and agent ergonomics:

### Inner Loop: Fast Feedback (`check:fast`)

Use during active coding, iterative refactoring, and debugging (~1.5s execution time):

```bash
npm run check:fast
```

Runs:

1. `typecheck` (`tsc -b` in strict mode)
2. `lint` (ESLint strict-type-checked)
3. `test:server` (In-memory server & canary contract tests on isolated test database)

### Outer Loop: Unified Verification Gate (`check`)

Before completing any task, PR, or commit, execute the full Definition of Done:

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
