# Architecture Overview

## Directory Structure

```
├── src/
│   ├── app/
│   │   ├── [locale]/          # Localized page routes
│   │   └── api/               # REST API routes (GET/POST only)
│   ├── components/            # React components
│   ├── context/               # AuthProvider, UiProvider (toast system)
│   └── lib/
│       ├── database/          # Supabase helpers
│       ├── services/          # AI services (Gemini)
│       └── helpers/           # Utilities (JWT, password, parliament scraper)
├── hooks/                     # Custom React hooks
├── messages/                  # i18n translations (en.json, es.json)
└── parliamentDataExtractor/   # Spanish Congress data extraction
```

## Key Patterns

### Root Layout

The root layout wraps the app with providers:

```typescript
// src/app/[locale]/layout.tsx
<AuthProvider>
  <UiProvider>
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  </UiProvider>
</AuthProvider>
```

### Client Components

Mark client components with `"use client"` at the top of the file.
