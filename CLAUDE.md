# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev

# Type checking
pnpm typecheck

# Lint (zero warnings enforced)
pnpm lint
pnpm lint:fix

# CI (lint + typecheck)
pnpm ci

# Tests (jest, passWithNoTests — allowed to fail)
pnpm test

# Supabase local stack
pnpm supabase <sub command>
```

Always use `pnpm`, never `npm`.

`pnpm ci` runs lint + typecheck. There are no mandatory automated tests yet — jest is configured with `--passWithNoTests`.

## Architecture

**Stack:** Next.js 16 App Router · TypeScript strict · Tailwind CSS v4 · Supabase (Postgres + Auth) · `@supabase/ssr` · React Hook Form + Zod · Recharts · Base UI

**Layer separation:**
- `app/` — Route handlers and page components. Split into `(auth)` and `(dashboard)` route groups.
- `components/` — UI (`components/ui/`) and domain components (`components/movimientos/`, `components/dashboard/`, etc.)
- `services/` — All business logic. Never call the Supabase client directly from API routes; use the service layer.
- `lib/supabase/` — Supabase client helpers:
  - `server.ts` — SSR client (reads/writes cookies, used in API routes and Server Components)
  - `client.ts` — browser client (used in Client Components)
  - `admin.ts` — service role client (bypasses RLS; used only for user management)
- `lib/permissions/rbac.ts` — role checks (`ADMIN`, `OPERATOR`, `VIEWER`)
- `lib/validators/` — Zod schemas shared between API routes and forms
- `middleware.ts` — route protection; unauthenticated requests redirect to `/login`
- `types/` — Shared TypeScript types; `types/database.types.ts` is auto-generated (do not edit manually)

**Data flow for mutations:**
API route → reads Supabase session → validates with Zod schema from `lib/validators/` → calls service → service uses Supabase server client → service calls `auditoriaService` for audit log → API route calls `processMovimientoIntegrations` (PDF/Sheet/email via Google Apps Script webhooks)

**Auth:**
Supabase Auth with email/password (`signInWithPassword`). No public sign-up — accounts are created by an ADMIN via the usuarios management page. Session is read server-side via `createServerClient()` from `lib/supabase/server.ts`. Role enforcement via `lib/permissions/rbac.ts` — three roles: `ADMIN`, `OPERATOR`, `VIEWER`.

**Folio system:**
Sequential numeric ID stored in the `folio_counter` table (singleton row `id: 'main'`). Incremented atomically via the `increment_and_get_folio()` Postgres RPC on each movement creation. `folio_display` is a generated column (`lpad(folio::text, 6, '0')`).

**User creation:**
Admins call the `create_user_with_role(email, password, full_name, role)` Postgres RPC via the service role client. Password hashing is handled inside the RPC via `pgcrypto` — no bcrypt in app code. First-deploy bootstrap: call `create_initial_admin(email, password, full_name)` once from Supabase Studio SQL editor.

**Google integrations:**
Three outbound webhooks via Google Apps Script (configured via env vars): PDF generation + Drive storage, email notification, Google Sheets sync. All triggered in `services/google/movement-postprocess.ts` after a movement is created/edited. Integration state tracked on `movements` (`pdf_status`, `synced_to_sheet`, `notification_status`, etc.).

**Database schema:**
Migrations live in `supabase/migrations/`. Key tables: `users`, `movements`, `movement_audit_log`, `system_audit_log`, `folio_counter`. All tables have RLS enabled. Run `pnpm supabase:reset` to wipe and re-apply from scratch locally.

Always use `pnpm supabase migration new ...` for new migrations

Always make sure that types with `pnpm types:generate` are up to date 

## Key conventions

- Always use `pnpm`, never `npm` or `yarn`.
- All Zod schemas live in `lib/validators/` and are shared between API routes and forms.
- UI components in `components/ui/` use Base UI (not Radix). Don't swap to Radix primitives.
- Tailwind uses Material Design-inspired semantic tokens (`surface`, `on-surface`, `primary`, `surface-container-*`, etc.) — stick to these rather than raw color values.
- No deletions: `movements` records are logically cancelled (`status: 'CANCELLED'`) with `cancellation_reason`. Physical deletion is not supported.
- Every mutation on a movement must insert a `movement_audit_log` entry via `auditoriaService`. Use the service role client for audit inserts (bypasses RLS).
- DB field names are English snake_case matching the Postgres schema. Spanish is used only in UI display labels (e.g. `INCOME` → "Ingreso", `OPERATOR` → "Operador").
- `types/database.types.ts` is generated — never edit it manually. Regenerate with `pnpm supabase:gen-types`.
- Code style: `.prettierrc` and `.editorconfig` are present — no semicolons, double quotes, `printWidth` 100, trailing commas off.

## Environment variables

See `.env.example`. Critical ones:
- `NEXT_PUBLIC_SUPABASE_URL` — from `pnpm supabase:status` → Project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — from `pnpm supabase:status` → Publishable key
- `SUPABASE_SECRET_KEY` — from `pnpm supabase:status` → Secret key (server-side only, never exposed to client)
- `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` / `GOOGLE_APPS_SCRIPT_SECRET` — Google integrations (optional locally)
- `GOOGLE_DRIVE_FOLDER_ID` / `GOOGLE_SHEET_ID` — Google Drive and Sheets targets
- `NOTIFICATION_EMAIL` — email notification config

## CI pipeline

`.github/workflows/ci.yml` runs on every push and PR:
1. **Lint & Typecheck** — `pnpm lint` + `pnpm typecheck` (must pass)
2. **Tests** — `pnpm test` with `continue-on-error: true` (allowed to fail while test suite is being built)
3. **Supabase Migrations** — `supabase db push` (runs on `main` pushes only; requires `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID` secrets)
