---
trigger: glob
globs: "src/client/routes/**, src/client/routeTree.gen.ts"
description: TanStack Router conventions, route tree protection, and type-safe navigation.
---

# Routing Guidelines (TanStack Router)

Guidelines for file-based client routing with TanStack Router.

## 1. Route Conventions

- **Route Directory**: Place route modules strictly under `src/client/routes/`.
- **Protected File**: NEVER manually edit `src/client/routeTree.gen.ts`. It is automatically generated and synchronized by `@tanstack/router-plugin/vite` or via `vpr routes:generate`.
- **Routes Configuration**: Routes configuration lives in `vite.config.ts` under `tanstackRouter({ routesDirectory: "./src/client/routes", generatedRouteTree: "./src/client/routeTree.gen.ts", autoCodeSplitting: true })`.

## 2. Navigation & Type-Safety

- **Type-Safe Search Parameters**: Validate query parameters using `validateSearch` on `createFileRoute`.
- **Type-Safe Navigation**: Use `useNavigate` and `Link` components from `@tanstack/react-router` with typed `to`, `search`, and `params` arguments.
