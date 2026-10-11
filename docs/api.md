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

## AI Promise Extraction

- `POST /api/parties/campaigns/extract-promises` — admin only. Body `{ campaign_id }`. Downloads the campaign PDF link and returns AI drafts `[{ subject_id, subject_name, promises[] }]` without saving. Errors return `{ error, code }` with `code` in `INVALID_URL` (400), `NOT_PDF` (422), `TOO_LARGE` (413), `DOWNLOAD_FAILED` (502), `AI_FAILED` (502). `maxDuration = 300`.
- `POST /api/parties/promises/bulk` — admin only. Body `{ party_id, campaign_id, promises: [{ subject_id, promise }] }`. Inserts all promises in one request; returns `{ count }`.

See [AI Integration](ai.md#promise-extraction-from-campaign-pdfs).

## Subjects

`/api/parties/subjects` — `GET` is public; `POST`, `PATCH` and `DELETE` are admin only and used by the `SubjectsManager` admin component.

- `POST { name, description }` / `PATCH { subject_id, name, description }` — return `409 { code: "DUPLICATE_NAME" }` when the name already exists (`subjects.name` is unique).
- `DELETE { subject_id }` — returns `409 { code: "SUBJECT_IN_USE" }` while promises still reference the subject (`promises.subject_id` has no cascade).
