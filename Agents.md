# Demosratio - AI Coding Agent Guide

## Project Overview
Next.js 15 app tracking Spanish political promises vs voting records. Uses Gemini AI to analyze if party promises align with their parliament votes.

## Architecture

### Core Stack
- **Framework**: Next.js 15 App Router + TypeScript
- **Database**: Supabase (PostgreSQL with RLS policies)
- **i18n**: next-intl with dynamic locale routing (es, ga, ca, eu)
- **Styling**: Tailwind CSS with custom fonts (`--font-roboto`, `--font-roboto-serif`)
- **Logging**: tslog (import from `tslog`)

### Directory Structure
```
├── src/app/[locale]/          # Localized page routes
├── src/app/api/               # REST API routes (GET/POST only)
├── src/components/            # React components
├── src/context/               # AuthProvider, UiProvider (toast system)
├── lib/
│   ├── database/              # Supabase helpers (use supabaseAdmin server-side)
│   ├── services/              # AI services (Gemini integration)
│   └── helpers/               # Spanish Parliament scraper, JWT, password utils
├── hooks/use-request.tsx      # Axios wrapper with automatic toast errors
└── messages/                  # i18n translations (en.json, es.json)
```

## Key Patterns

### Database Schema & Relationships
```
parties (id, name, logo_url)
  └── campaigns (party_id) - one party has many campaigns
       └── promises (campaign_id, party_id) - promises linked to campaign + party
            └── promises_analysis (promise_id)
       └── promises_readiness_index (campaign_id)
subjects (id, name) - categories for promises
users (id, name, password, is_admin)
  └── user_devices (user_id) - device fingerprinting
  └── proposal_likes/dislikes (user_id)
  └── promises_readiness_index (user_id)
proposals (id, title, votes_parties_json, votes_for, votes_against, etc.) - Spanish Congress votes
  └── proposal_likes/dislikes (proposal_id)
```

**Key tables**: `promises`, `proposals`, `parties`, `campaigns`, `users`

### Database Access
- **Server-side (API routes)**: Use [`supabaseAdmin`](lib/supabaseClient.ts:7) with service role key
- **Client-side**: Use [`supabase`](lib/supabaseClient.ts:10) with anon key (respects RLS)
- All helpers return `{ data, error }` pattern from Supabase

### API Routes Examples
**Simple GET with query params** ([`parties/promises/analysis/route.ts`](src/app/api/parties/promises/analysis/route.ts)):
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const party_id = Number(searchParams.get("party_id"));
  // ... validation, fetch data, return NextResponse.json(data)
}
```

**POST with auth + body** ([`users/signin/route.ts`](src/app/api/users/signin/route.ts)):
```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();
  // ... validation, DB queries, JWT creation, cookie setting
  return NextResponse.json(existingUser, { status: 200 });
}
```

### Authentication
- **Custom JWT auth** with device fingerprinting (NOT Supabase Auth)
- Fingerprint similarity threshold: [`0.9`](constants.ts:2)
- Session cookie: `httpOnly: true`, `secure: true`, `sameSite: "none"`
- [`useAuth()`](src/context/authContext.tsx:55) hook: `currentUser`, `loading`, `updateCurrentUser()`

### Component Structure & State Management
- **Root layout** wraps with [`AuthProvider`](src/app/[locale]/layout.tsx:90) + [`UiProvider`](src/app/[locale]/layout.tsx:91)
- **Client components**: `"use client"` at top of file
- **State**: Uses React `useState`, context providers, and the [`PartiesProvider`](src/components/Parties/PartyStateManager.tsx) for party selection state
- **Data fetching**: [`useRequest()`](hooks/use-request.tsx:16) hook wraps axios with error handling + toasts
- **Example page** ([`promises/page.tsx`](src/app/[locale]/promises/page.tsx)): Uses state to toggle between views

### AI Integration
- Service: Gemini 1.5 Flash API
- Entry: [`analyzePromisesWithGemini()`](lib/services/geminiClient.ts:7)
- Prompts: Spanish language, strict JSON output format
- Handles rate limits with 10s backoff
- Flow: `aiPromiseAnalizer()` → fetches parties/campaigns → calls Gemini → returns analysis

### Toast Notifications
- Wrap app with [`UiProvider`](src/app/[locale]/layout.tsx:91) in root layout
- Use [`useUiContext()`](src/context/uiContext.tsx:35) → `showToast({ message, variant, duration })`
- Variants: `"error"`, `"success"`, etc.

### API Calls from Components
- Use [`useRequest()`](hooks/use-request.tsx:16) hook
- Handles errors + automatic toast display
- Example:
```typescript
const { doRequest, errors } = useRequest({ 
  url: "/api/parties/promises", 
  method: "GET" 
});
const data = await doRequest({ party_id: 1 });
```

### i18n
- Locales defined in [`src/i18n/routing.ts`](src/i18n/routing.ts): `["es", "ga", "ca", "eu"]`
- Middleware handles locale detection ([`middleware.ts`](src/middleware.ts))
- Pages use `useTranslations()` hook for text
- Messages in `messages/*.json` files

## External Data Sources
- **Spanish Congress**: Scrapes voting data from congreso.es via ZIP/JSON extraction
- See [`extractParliamentJson()`](lib/helpers/spanishParliamentExtractor/getParliamentData.ts:8)

## Developer Commands
```bash
npm run dev        # Next.js dev with Turbopack (fast refresh)
npm run build      # Production build
npm run lint       # ESLint
```

## Important Files
- [`schema.sql`](schema.sql) - Database schema with RLS policies
- [`middleware.ts`](src/middleware.ts) - i18n routing matcher
- [`next.config.ts`](next.config.ts) - Turbopack enabled, output: "standalone"
- [`lib/services/geminiClient.ts`](lib/services/geminiClient.ts) - AI analysis with Spanish prompts
- [`lib/database/parties/promises/`](lib/database/parties/promises/) - Promise-related DB helpers

## Tools & Versions (from package.json)

### Core Dependencies:
- **next**: ^15.1.9 - React framework with App Router
- **next-intl**: ^3.26.3 - Internationalization (i18n) library
- **react**: ^19.0.1 - UI library
- **react-dom**: ^19.0.1 - React DOM renderer
- **@supabase/supabase-js**: ^2.49.1 - Supabase client for database operations
- **chart.js**: ^4.4.8 - Chart visualization library

### Dev Dependencies:
- **typescript**: ^5 - TypeScript compiler
- **tailwindcss**: ^3.4.1 - CSS utility framework
- **eslint**: ^9 - JavaScript/TypeScript linter
- **eslint-config-next**: ^15.1.6 - Next.js ESLint configuration
- **postcss**: ^8 - CSS processing tool

### i18n Configuration:
The project uses **next-intl** (v3.26.3) for internationalization:
- Translation files: `messages/en.json`, `messages/es.json`
- Locale middleware: `src/middleware.ts`
- Locale provider: `src/locale.ts`
- Usage: `useTranslations("namespace")` hook for accessing translations
- Namespaces used: `promises`, `parties`, `login`, `register`, `profile`, `admin`, etc.

## Recent Changes (2026-01-31)

### Promises Page UI/UX Improvements:
1. Simplified `promises/page.tsx` - removed dual-view navigation, uses unified PromisesView
2. Improved PromisesView - consistent party selection, better voting slider, back navigation
3. Enhanced PromiseWithAnalysisCard - better vote display with colored badges
4. Deleted unused components: PartyChoiceComponent, PromiseAnalysusComponent, AnalysisCard
5. Added all required translations to en.json and es.json
