# Components & UI

## State Management

- **Root layout** wraps with [`AuthProvider`](src/app/[locale]/layout.tsx:90) + [`UiProvider`](src/app/[locale]/layout.tsx:91)
- **Party selection state**: [`PartiesProvider`](src/components/Parties/PartyStateManager.tsx)
- **Local state**: React `useState`
- **Global state**: Context providers

## Toast Notifications

Wrap app with [`UiProvider`](src/app/[locale]/layout.tsx:91) in root layout.

### Show a Toast

Use [`useUiContext()`](src/context/uiContext.tsx:35):

```typescript
const { showToast } = useUiContext();
showToast({ message: "Success!", variant: "success", duration: 3000 });
```

### Toast Variants

- `"error"`
- `"success"`
- `"warning"`
- `"info"`

## External Data Sources

Spanish Congress voting data is scraped from congreso.es via ZIP/JSON extraction. See [`extractParliamentJson()`](lib/helpers/spanishParliamentExtractor/getParliamentData.ts:8).
