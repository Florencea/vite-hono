---
trigger: glob
globs: "src/server/database/**, drizzle.config.ts"
description: Drizzle ORM schema SSOT, dynamic DDL sync, and test database isolation standards.
---

# Database & Persistence Guidelines

Guidelines for database schema management, migrations, and test isolation.

## 1. Single Source of Truth (SSOT)

- **Schema Definition**: `src/server/database/schema.ts` is the single source of truth for all database tables and relations.
- **Code-First Workflow**: Push schema changes via `vpr db:push` (`drizzle-kit push`). Migration SQL snapshots under `drizzle/` are gitignored.

## 2. Dynamic Schema Sync & Seeding

- **Dynamic Table DDL**: `src/server/database/seed.ts` contains `syncDatabaseSchema()` and `seedDatabase()`. Dynamically derive table DDL from `schema.ts` without hardcoded SQL statements.
- **Dual-Database Seeding**: Automatically seeds both the primary database (`database.sqlite`) and local Cloudflare D1 (`.wrangler/state/v3/d1/*.sqlite`).

## 3. Ephemeral Test Database Isolation

- **Test Database Isolation**: All automated tests run against an isolated ephemeral database (`database.test.sqlite`) configured via `DATABASE_URL: "file:./database.test.sqlite"`.
- **Teardown Cleanup**: `test/global-setup.ts` automatically resets and cleans up the test database on setup and teardown, preventing mutation of the local development database.
