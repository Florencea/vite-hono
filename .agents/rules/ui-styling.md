---
trigger: glob
globs: "src/client/components/**, src/client/routes/**, src/client/theme.ts, src/client/global.css"
description: Ant Design v6 and TailwindCSS v4 integration rules and React 19 styling conventions.
---

# UI & Styling Architecture Guidelines

Guidelines for building UI components with Ant Design v6, TailwindCSS v4, and React 19.

## 1. Single Source of Truth (SSOT)

- **Design Tokens**: TailwindCSS v4 `@theme` in `src/client/global.css` is the sole source of truth for design tokens.
- **Dynamic Token Bridging**: `src/client/theme.ts` dynamically extracts CSS variables into Ant Design tokens. Never hardcode fallback colors in component styles.

## 2. Component Styling Rules

- **No Inline `style`**: Never use `style={{ ... }}` on Ant Design or React components. Prefer Ant Design layout components (`Layout`, `Flex`, `Space`, `Row`, `Col`, `Card`).
- **No `!` (important)**: Never use the `!` modifier in Tailwind classes. Tailwind utilities are scoped under `#root` with natural specificity over Ant Design.
- **Canonical Classes**: Use Tailwind CSS v4 canonical class syntax (e.g. `bg-(--variable)` instead of `bg-[var(--variable)]`). Run `vpr lint:tailwind` to diagnose and `vpr lint:tailwind:fix` to auto-fix.

## 3. React 19 & Core Component Wrappers

- **React Compiler**: Automatic fine-grained memoization is powered by React Compiler via `oxc-transform-react`. Do not write manual `useMemo`, `useCallback`, or `React.memo` unless handling non-compiler edge cases.
- **Core Wrappers**: Prefer composing from reusable core wrappers:
  - `<DataTable>`: Standardizes responsive scrolling (`max-content`) and default `rowKey="id"`.
  - `<DataModal>`: Enforces Ant Design 6 `destroyOnHidden` lifecycle and dialog modal defaults.
  - `<DataDrawer>`: Enforces Ant Design 6 `destroyOnHidden` lifecycle and drawer defaults.
  - `<PermissionButton>`: Seamlessly encapsulates RBAC permission checks with Ant Design's `Button`.
- **Forms**: Use `useAntdForm` for all Ant Design forms to standardize form instance binding, layout props, and typed field rules. Avoid `useEffect` to synchronize form values.
