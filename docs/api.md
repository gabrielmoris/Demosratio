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
