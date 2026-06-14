# Demosratio - AI Coding Agent Guide

A Next.js 15 app that tracks Spanish political promises and compares them against voting records. Uses Gemini AI to analyze whether party promises align with their parliament votes.

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with Turbopack (`--turbo`) |
| `npm run test` | Run tests with Vitest (`vitest run`) |
| `npm run coverage:open` | Run tests with coverage report |

> Typecheck: no dedicated script — use `tsc --noEmit` or check via `next build`.

## Core Stack

- **Database**: Supabase (PostgreSQL with RLS — all queries must respect row-level security)
- **i18n**: next-intl — locales: `es`, `ga`, `ca`, `eu`
- **AI**: Gemini 1.5 Flash

## Documentation

### Essentials
- [Architecture Overview](docs/architecture.md) — Project structure and patterns
- [Database Guide](docs/database.md) — Schema, relationships, and access patterns
- [API Routes](docs/api.md) — REST API conventions and examples

### Features
- [Authentication](docs/auth.md) — JWT auth with device fingerprinting
- [Components & UI](docs/components.md) — State management, toast notifications
- [AI Integration](docs/ai.md) — Gemini prompts and analysis flow
- [Internationalization](docs/i18n.md) — Locale setup and translation workflow
- [Testing](docs/testing.md) — Vitest setup, mocking patterns, coverage

## Key Files

- [`supabase/migrations/`](supabase/migrations/) — Database schema with RLS policies
- [`src/middleware.ts`](src/middleware.ts) — i18n routing (locale detection and redirect)
- [`lib/supabaseClient.ts`](lib/supabaseClient.ts) — Database clients (server vs. browser)

## Important

Whenever you implement new functionality, change existing behavior, refactor significant code, or remove features, keep both the `/docs` folder and this file up to date.
