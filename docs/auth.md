# Authentication

## Custom JWT Auth

The app uses custom JWT authentication with device fingerprinting (NOT Supabase Auth).

## Configuration

- **Fingerprint similarity threshold**: [`0.9`](constants.ts:2)
- **Session cookie**: `httpOnly: true`, `secure: true`, `sameSite: "none"`

## Auth Hook

Use the [`useAuth()`](src/context/authContext.tsx:55) hook:

```typescript
const { currentUser, loading, updateCurrentUser } = useAuth();
```

## External Data

Spanish Congress voting data is scraped from congreso.es via ZIP/JSON extraction. See [`extractParliamentJson()`](lib/helpers/spanishParliamentExtractor/getParliamentData.ts:8).
