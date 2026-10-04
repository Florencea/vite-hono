---
trigger: glob
globs: "test/**, **/*.test.ts, **/*.test.tsx"
description: Testing standards for Vitest Browser mode (Chromium) and in-memory Server suites.
---

# Testing Standards & Guidelines

Guidelines for automated testing across the dual-track testing architecture.

## 1. Dual-Track Testing Architecture

- **Client Tests (`vpr agent:test:e2e`)**:
  - Run inside headless Chromium via Vitest (`vite-plus/test/browser-playwright`).
  - Use `renderAppAt(initialUrl)` from `test/client/test-utils.tsx` to mount routes with complete `<Providers>` and router context.
  - Assert both presence and visibility:
    - `await expect.element(el).toBeInTheDocument()`
    - `await expect.element(el).toBeVisible()`
  - Prefer accessible queries (`screen.getByRole`, `screen.getByLabelText`) or `data-testid`. Never query volatile CSS classes.
- **Server Tests (`vpr agent:test:unit`)**:
  - Run in Node.js environment.
  - Leverage Hono's native in-memory `app.request()` for fast, deterministic HTTP/RPC and schema verification without port conflicts.

## 2. End-to-End Type Safety Contracts

- **Static Contract Assertions**: Guard type parity between server schemas and client RPC types using `expectTypeOf` in `test/canary/e2e-type-contract.test.ts`.
- **Security Audit Contracts**: Guard RBAC declarations on all endpoints via `test/canary/rbac-contract.test.ts`.
