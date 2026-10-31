# API Routes

## REST Conventions

- **GET**: Retrieve data with query parameters
- **POST**: Create resources or perform actions with body

## Examples

### Simple GET with Query Params

[`src/app/api/parties/promises/analysis/route.ts`](src/app/api/parties/promises/analysis/route.ts):

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const party_id = Number(searchParams.get("party_id"));
  
  // Validation, fetch data, return response
  return NextResponse.json(data);
}
```

### POST with Auth + Body

[`src/app/api/users/signin/route.ts`](src/app/api/users/signin/route.ts):

```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Validation, DB queries, JWT creation, cookie setting
  return NextResponse.json(existingUser, { status: 200 });
}
```

## Data Fetching from Components

Use the [`useRequest()`](hooks/use-request.tsx:16) hook for API calls:

```typescript
const { doRequest, errors } = useRequest({ 
  url: "/api/parties/promises", 
  method: "GET" 
});
const data = await doRequest({ party_id: 1 });
```

The hook wraps axios with error handling and automatic toast display.

## Legislatura scoping

Public data routes return the data of one legislatura: `?legislatura=16` (or `XVI`), defaulting to the current one. This applies to `/api/spanish-proposals`, `/search`, `/alignment`, `/api/temas`, `/api/temas/[id]` and `/api/parties`. Components build the url with `withLegislatura(url, selectedId)` from `lib/helpers/legislatura.ts`.

- `GET /api/parties?legislatura=16` — parties with a campaign in that legislatura, each with it in `campaigns`. `?all=true` returns every party (admin: add an existing party to a legislatura).
- `GET /api/parties/campaigns?party_id=1&legislatura=16` — the party's campaign in that legislatura.
- `GET /api/parties/promises/dashboard` and `/all-analyses-by-party` take `campaign_id` to count only that campaign's promises.

## Legislaturas

- `GET /api/legislaturas` — public, newest first.
- `POST` / `PATCH /api/legislaturas` — admin only. Body `{ id, election_date, start_date, end_date }` (`id` as number or Roman numeral, dates `YYYY-MM-DD` or empty). `409 DUPLICATE_LEGISLATURA` when it exists.
- `DELETE /api/legislaturas { id }` — admin only. `409 LEGISLATURA_IS_CURRENT` for the current one, `409 LEGISLATURA_IN_USE` while campaigns or votes belong to it.
- `POST /api/legislaturas/current { id }` — admin only. Makes it the current legislatura.

## Parties and campaigns (admin)

- `POST /api/parties { name, logo_url }` — `409 DUPLICATE_PARTY`. `DELETE { party_id }` — `409 PARTY_IN_USE` while it has campaigns.
- `POST /api/parties/campaigns { year, party_id, campaign_pdf_url, legislatura_id }` adds a party to a legislatura — `409 PARTY_ALREADY_IN_LEGISLATURA`.
- `PATCH /api/parties/campaigns { campaign_id, year, campaign_pdf_url }` edits it. `DELETE { campaign_id }` removes the party from the legislatura — `409 CAMPAIGN_IN_USE` while it has promises or user ratings.

## Pending promise analysis

`GET /api/cron/promise-analysis[?limit=N]` (cron 01:30 daily, or admin / `CRON_SECRET`) analyses the current legislatura's votes with `promise_analysis_status = 'pending'`. Returns `{ kind: 'promise-analysis', processed, remaining, stoppedBecause? }`; `stoppedBecause` is `no_promises`, `rate_limit` or `time_budget`. `PROMISE_ANALYSES_PER_RUN` sets the default batch (5).

## AI Promise Extraction

- `POST /api/parties/campaigns/extract-promises` — admin only. Body `{ campaign_id }`. Gemini reads the campaign PDF link itself and the route returns AI drafts `[{ subject_id, subject_name, promises[] }]` without saving. Errors return `{ error, code }` with `code` in `INVALID_URL` (400), `PDF_NOT_READ` (422, Gemini could not open the link), `AI_FAILED` (502). `maxDuration = 300`.
- `POST /api/parties/promises/bulk` — admin only. Body `{ party_id, campaign_id, promises: [{ subject_id, promise }] }`. Inserts all promises in one request; returns `{ count }`.

See [AI Integration](ai.md#promise-extraction-from-campaign-pdfs).

## Subjects

`/api/parties/subjects` — `GET` is public; `POST`, `PATCH` and `DELETE` are admin only and used by the `SubjectsManager` admin component.

- `POST { name, description }` / `PATCH { subject_id, name, description }` — return `409 { code: "DUPLICATE_NAME" }` when the name already exists (`subjects.name` is unique).
- `DELETE { subject_id }` — returns `409 { code: "SUBJECT_IN_USE" }` while promises still reference the subject (`promises.subject_id` has no cascade).

## Home page

`GET /api/home?legislatura=16` (defaults to the current legislatura) returns everything the home page shows, built by `getHomeOverview()` in `lib/database/home/getHomeOverview.ts` (types in `types/home.ts`):

- `counters`: `totalVotes`, `analysedVotes` (all votes minus those with `promise_analysis_status = 'pending'`) and `promiseChecks` (rows in `promise_status` for votes of that legislatura).
- `latestVotes`: the 3 newest votes, with likes, as `/api/spanish-proposals` returns them.
- `period`: the 30 days ending on the **last day the legislatura voted** (not today), so the block isn't empty when Congress doesn't sit. A single week is too short: contradictions are rare (about 1 analysis in 6), and most weeks have none. Filtered on the vote date (`proposals.date`), not on when the analysis was saved: pending votes are analysed days later.
- `contradicted`: the 5 promises contradicted by the most votes of that period ("Contradictory Evidence" in `promise_status`), each with up to 3 of those votes.
