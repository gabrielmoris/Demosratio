# Components & UI

## State Management

- **Root layout** wraps with [`AuthProvider`](src/app/[locale]/layout.tsx:90) + [`UiProvider`](src/app/[locale]/layout.tsx:91)
- **Party selection state**: [`PartiesProvider`](src/components/Parties/PartyStateManager.tsx)
- **Legislatura**: [`LegislaturaProvider`](src/context/legislaturaContext.tsx) in the root layout loads the legislaturas; `useLegislatura()` gives `selectedId` (send it with `withLegislatura(url, selectedId)`). The choice defaults to the current legislatura and lasts for the browser session only.
  - [`LegislaturaScoped`](src/components/LegislaturaScoped.tsx) wraps every page that shows legislatura data and mounts it again when the legislatura changes, so pages don't need to reset their own state.
  - [`LegislaturaSwitcher`](src/components/LegislaturaSwitcher.tsx): the Roman numeral at the end of the navbar (`title` "Legislatura").
  - [`LegislaturaBanner`](src/components/LegislaturaBanner.tsx): notice shown while viewing a legislatura that isn't the current one.
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

