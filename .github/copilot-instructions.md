# Demosratio - Copilot Instructions

See [Agents.md](../Agents.md) for full project guidance.

## Quick Reference

### Tech Stack
- Next.js 15 App Router + TypeScript
- Supabase (PostgreSQL with RLS)
- Custom JWT auth with device fingerprinting
- Gemini AI for political analysis

### Database Schema
```
parties → campaigns → promises (with party_id)
subjects → promises
users → proposal_likes/dislikes, user_devices, promises_readiness_index
proposals → proposal_likes/dislikes
```

### Key Patterns
- Server-side DB: `supabaseAdmin` from `@/lib/supabaseClient`
- Client-side DB: `supabase` with anon key (RLS applies)
- API routes: `src/app/api/*/route.ts` (GET/POST only)
- Components: Use `useRequest()` hook for API calls
- Errors: Use `useUiContext().showToast()` for user feedback
- i18n: `useTranslations()` hook, locales in `messages/*.json`

### Example API Route
```typescript
// src/app/api/parties/promises/analysis/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const party_id = Number(searchParams.get("party_id"));
  // ... fetch data with supabaseAdmin, return NextResponse.json(data)
}
```

### Commands
- `npm run dev` - Dev server with Turbopack
- `npm run build` - Production build
- `npm run lint` - ESLint

### Important Files
- `schema.sql` - Database schema with RLS policies
- `lib/services/geminiClient.ts` - AI integration
- `lib/helpers/spanishParliamentExtractor/getParliamentData.ts` - External data
- `src/app/[locale]/promises/page.tsx` - Component structure example
