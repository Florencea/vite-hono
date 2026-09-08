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

## 3. Verification Gate (Definition of Done)

Before completing any task or commit, execute the unified verification gate:

```bash
npm run check
```

Runs:

1. `typecheck` (`tsc -b` in strict mode)
2. `lint` (ESLint strict + stylistic type checks)
3. `format:check` (Prettier style check)
4. `check:deadcode` (Knip zero-config dead-code audit)
5. `build` (Client SPA + SSR server build)

All checks must pass with 0 errors and 0 warnings.
