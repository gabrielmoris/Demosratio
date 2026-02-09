# Demosratio - AI Coding Agent Guide

A Next.js 15 app that tracks Spanish political promises and compares them against voting records. Uses Gemini AI to analyze whether party promises align with their parliament votes.

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev with Turbopack |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Core Stack

- **Framework**: Next.js 15 App Router + TypeScript
- **Database**: Supabase (PostgreSQL with RLS)
- **i18n**: next-intl (`es`, `ga`, `ca`, `eu`)
- **Styling**: Tailwind CSS
- **AI**: Gemini 1.5 Flash

## Documentation

### Essentials
- [Architecture Overview](docs/architecture.md) - Project structure and patterns
- [Database Guide](docs/database.md) - Schema, relationships, and access patterns
- [API Routes](docs/api.md) - REST API conventions and examples

### Features
- [Authentication](docs/auth.md) - JWT auth with device fingerprinting
- [Components & UI](docs/components.md) - State management, toast notifications
- [AI Integration](docs/ai.md) - Gemini prompts and analysis flow
- [Internationalization](docs/i18n.md) - Locale setup and translation workflow

## Key Files

- [`schema.sql`](schema.sql) - Database schema with RLS policies
- [`middleware.ts`](src/middleware.ts) - i18n routing
- [`next.config.ts`](next.config.ts) - Next.js configuration
- [`lib/supabaseClient.ts`](lib/supabaseClient.ts) - Database clients

## Important
Whenever you implement new functionality, change existing behavior, refactor significant code, or remove features, you must keep both the /docs folder and Agents.md files up to date.