# Database Guide

## Schema Overview

```
legislaturas (id = number: 15 = XV, election_date, start_date, end_date, is_current)
  └── campaigns (legislatura_id)        UNIQUE (party_id, legislatura_id)
  └── proposals (legislatura_id)
parties (id, name UNIQUE, logo_url, abbreviation)
  └── campaigns (party_id)              ← a party is in a legislatura through its campaign
       └── promises (campaign_id, party_id)
            └── promise_status (promise_id, proposal_id)   ← AI analyses
       └── promises_readiness_index (campaign_id)
subjects (id, name UNIQUE, description)   ← fixed taxonomy shared by all legislaturas, edited in admin; AI extraction only uses these
users (id, name, password, is_admin)
  └── user_devices (user_id)
  └── proposal_likes/dislikes (user_id)
  └── promises_readiness_index (user_id)
proposals (id, title, votes_parties_json, votes_for, votes_against, legislatura_id, promise_analysis_status, etc.)
  └── proposal_likes/dislikes (proposal_id)
```

## Legislaturas

Every term of the Congreso is a row in `legislaturas` (`id` is the number, shown as a Roman numeral with `legislaturaLabel()`).
Migration: `supabase/migrations/20261024120000_legislaturas.sql`.

- **Parties belong to a legislatura through their campaign**: one campaign (year + PDF + promises) per party and legislatura. Parties themselves are shared, so PSOE is the same row in XV and XVI and a party missing from a legislatura simply has no campaign there.
- **Votes** (`proposals.legislatura_id`) belong to the legislatura congreso.es published them in.
- **Current legislatura** (`is_current`, at most one, switched with the `set_current_legislatura(id)` SQL function): what the website shows by default and what the cron scrapes and analyses. `TARGET_LEGISLATURA` is only a fallback when no row is current.
- **`promise_analysis_status`**: `done`, or `pending` for votes saved while their legislatura wasn't current (or had no promises yet). `/api/cron/promise-analysis` analyses the pending votes of the current legislatura.
- **Everything public is scoped** to one legislatura: votes, search, alignment, temas, parties, promises and their stats. API routes read `?legislatura=16` (or `XVI`) and default to the current one (`resolveLegislaturaId()` in `lib/database/legislaturas/getLegislaturas.ts`).
- **Admin**: legislaturas are created, edited, deleted and made current in `/admin/manage-parties` (`LegislaturasManager`). One with campaigns or votes can't be deleted, nor can the current one.

### Starting a new legislatura

1. Admin → Manage parties → Legislaturas: add XVI with its election date.
2. Choose XVI in "Legislatura que estás editando", add each party (existing or new) with its campaign year and PDF, generate and review the promises with AI.
3. Meanwhile the cron keeps saving any XVI votes it finds as `pending`.
4. Click "Hacer actual" on XVI: the site shows XVI by default, the cron scrapes XVI and the pending votes are analysed by `/api/cron/promise-analysis` (daily, or "Analizar votaciones pendientes" in the admin panel).

## Database Clients

### Server-side (API Routes)

Use [`supabaseAdmin`](lib/supabaseClient.ts:7) with service role key:

```typescript
import { supabaseAdmin } from "@/lib/supabaseClient";
```

### Client-side

Use [`supabase`](lib/supabaseClient.ts:10) with anon key (respects RLS):

```typescript
import { supabase } from "@/lib/supabaseClient";
```

## Helper Functions

All helpers return `{ data, error }` pattern from Supabase:

```typescript
// Example: lib/database/parties/getAllParties.ts
export async function getAllParties() {
  return await supabase.from("parties").select("*");
}
```

### Key Helpers

- [`lib/database/parties/getAllParties.ts`](lib/database/parties/getAllParties.ts)
- [`lib/database/parties/promises/getPartyPromises.ts`](lib/database/parties/promises/getPartyPromises.ts)
- [`lib/database/parties/promises/promises-analysis/getPromiseAnalysisByPromise.ts`](lib/database/parties/promises/promises-analysis/getPromiseAnalysisByPromise.ts)
