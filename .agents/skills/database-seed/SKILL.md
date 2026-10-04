---
name: database-seed
description: Workflow for database schema synchronization, Drizzle Kit push, and initial seed data population.
compatibility: Vite+, Drizzle ORM, SQLite, Cloudflare D1
---

# Database Sync & Seed Workflow

This skill outlines the procedure to push schema changes and re-seed the SQLite and Cloudflare D1 databases.

## 1. Push Schema Changes (Code-First)

Push local schema declarations from `src/server/database/schema.ts` directly:

```bash
vpr db:push
```

## 2. Seed Databases

Execute dynamic database synchronization and seed initial administrator, departments, and roles:

```bash
vpr db:seed
```

This updates both `database.sqlite` and local Cloudflare D1 databases (`.wrangler/state/v3/d1/`).

## 3. Verify Database Integrity

Run server contract tests to ensure permissions, users, roles, and departments pass:

```bash
vpr agent:test:unit
```
