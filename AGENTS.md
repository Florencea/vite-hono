# Agent Development Guidelines

Guidelines for AI agents and developers working on this repository.

## 1. Architectural Conventions

- **Frontend (`src/client/`)**:
  - **Routes**: Modular routes in `src/client/routes/`. Never edit `src/client/routeTree.gen.ts` (auto-generated).
  - **Components**: Reusable UI elements in `src/client/components/`.
- **Backend (`src/server/`)**:
  - **Routes**: Modular OpenAPI handlers in `src/server/routes/`.
  - **Database**: Drizzle schema in `src/server/database/schema.ts`.
- **Styling & SSOT**:
  - **Single Source of Truth**: TailwindCSS v4 `@theme` in `src/client/global.css` defines all tokens.
  - **Token Bridge**: `src/client/theme.ts` dynamically extracts CSS variables into Ant Design tokens. Never hardcode fallback colors.
  - **No Inline `style`**: Prefer Ant Design layout components (`Layout`, `Flex`, `Space`, `Row`, `Col`, `Card`).
  - **No `!` (important)**: Tailwind is scoped under `#root` with natural specificity over Ant Design.
- **Language & i18n**:
  - Multi-language support (`zh-TW` and `en-US`) across UI and server.
  - Keep code comments in concise English.

## 2. Strict Coding Standards

- **No `any`**: Always provide explicit TypeScript types or generics.
- **No `@ts-ignore`**: Use `@ts-expect-error` with a descriptive reason only if strictly unavoidable.
- **No Floating Promises**: Always `await` or properly handle Promises.
- **No Dead Code**: Do not export unused types/functions or leave unused dependencies. Knip checks this.
- **No Linter Workarounds**: Never weaken `eslint.config.ts`. Fix code directly to satisfy strict rules.
- **Explicit String Conversions**: Call `.toString()` on numbers in template literals.

## 3. Testing Standards

- **Dual-Track Testing Architecture**:
  - **Client (`test:client`)**: Runs inside headless Chromium (`@vitest/browser-playwright`). Use `renderAppAt(initialUrl)` from `test/client/test-utils.tsx` to mount routes with complete `<Providers>` context.
  - **Server (`test:server`)**: Runs in Node.js environment. Leverage Hono's native `app.request()` for in-memory HTTP/RPC and schema verification without network port conflicts.
- **End-to-End Type Safety**:
  - Ensure server Zod schemas (`@hono/zod-openapi`) stay in sync with client RPC (`hc<AppType>`), `RouterInputs`, and Ant Design forms (`useAntdForm`).
  - Use `expectTypeOf` to guard static contracts in `test/canary/e2e-type-contract.test.ts`.
- **Selector Standards**:
  - Prefer accessible queries (`screen.getByRole`, `screen.getByLabelText`) or explicit `data-testid`.
  - Never query by volatile CSS classes (such as `.ant-btn-primary`).
- **Assertion Rigor**:
  - For browser UI elements, assert both DOM presence and visibility:
    - `await expect.element(el).toBeInTheDocument()`
    - `await expect.element(el).toBeVisible()`

## 4. Feature Development Workflow (Agent-First TDD)

When implementing a new feature or API, follow this end-to-end type-safe flow:

1. **Backend Schema First (`src/server/routes/<feature>/`)**:
   - Define request/response Zod schemas with `@hono/zod-openapi` in `<feature>.schema.ts`.
   - Register route specification using `createRoute()` in `<feature>.routes.ts`.
2. **Server Handler & In-Memory Test (`test/server/`)**:
   - Implement route handlers in `<feature>.handlers.ts` and export the sub-router in `<feature>/index.ts`.
   - Write in-memory HTTP integration tests using Hono's `app.request()` in `test/server/` to verify schemas, status codes, and edge cases.
3. **Expose RPC Route (`src/server/router.ts`)**:
   - Mount the sub-router into `apiRouter`. Hono RPC types (`AppType`, `api.<feature>`) infer automatically for client consumption.
4. **Client UI & Form (`src/client/`)**:
   - Define type aliases using `InferRequestType<typeof api.<feature>...>` in `src/client/constants/routes.tsx` (`RouterInputs`).
   - Connect Ant Design forms with `useAntdForm<RouterInputs["<feature>"]>()`.
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
3. `format:check` (Prettier style check)
4. `check:deadcode` (Knip zero-config dead-code audit)
5. `test` (Vitest dual-track tests: client browser + server in-memory)
6. `build` (Client SPA + SSR server build)

All checks must pass with 0 errors and 0 warnings.
