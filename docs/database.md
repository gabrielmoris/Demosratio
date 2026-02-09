# Database Guide

## Schema Overview

```
parties (id, name, logo_url)
  └── campaigns (party_id)
       └── promises (campaign_id, party_id)
            └── promises_analysis (promise_id)
       └── promises_readiness_index (campaign_id)
subjects (id, name)
users (id, name, password, is_admin)
  └── user_devices (user_id)
  └── proposal_likes/dislikes (user_id)
  └── promises_readiness_index (user_id)
proposals (id, title, votes_parties_json, votes_for, votes_against, etc.)
  └── proposal_likes/dislikes (proposal_id)
```

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
