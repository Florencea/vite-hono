---
name: scaffold-feature
description: Step-by-step workflow to scaffold a new full-stack feature slice with schema, routes, handlers, locales, and contract tests.
compatibility: Vite+, Hono, React 19, Ant Design v6
---

# Scaffold Feature Workflow

This skill outlines the procedure to bootstrap a new end-to-end type-safe feature slice.

## 1. Run Scaffolding Command

Execute the scaffolding script:

```bash
vpr scaffold:feature <feature-name>
```

This creates:

- Schema: `src/server/routes/<feature>/<feature>.schema.ts`
- Route Spec: `src/server/routes/<feature>/<feature>.routes.ts`
- Handlers: `src/server/routes/<feature>/<feature>.handlers.ts`
- Sub-Router: `src/server/routes/<feature>/index.ts`
- Contract Test: `test/server/<feature>-contract.test.ts`
- Auto-mounts the sub-router in `src/server/router.ts`
- Generates localized message keys in `src/locales/schema.ts`, `en-US.ts`, and `zh-TW.ts`

## 2. Implement Business Logic

1. Customize request/response fields in `<feature>.schema.ts`.
2. Connect database queries in `<feature>.handlers.ts`.
3. Add UI presentational components under `src/client/components/<feature>/` and client hook `src/client/hooks/use<Feature>.ts`.

## 3. Verify Newly Scaffolded Slice

Run verification gates:

```bash
vpr agent:verify:unit
```
