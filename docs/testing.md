# Testing

## Framework

- **Test Runner**: [Vitest](https://vitest.dev/) v4.0.18
- **Environment**: jsdom (for React component testing)
- **Configuration**: [`vitest.config.ts`](vitest.config.ts)
- **Setup File**: [`vitest.setup.ts`](vitest.setup.ts)

## Test File Patterns

Tests follow a mirroring structure under [`lib/__tests__/`](lib/__tests__/):

```
lib/
├── __tests__/
│   ├── database/
│   │   ├── parties/
│   │   │   └── getAllParties.test.ts
│   │   └── users/
│   │       └── fingerprint.test.ts
│   └── helpers/
│       ├── dateFormatters.test.ts
│       └── users/
│           ├── jwt.test.ts
│           └── password.test.ts
```

## Test File Naming

- `*.test.ts` / `*.test.tsx` - Unit tests
- `*.spec.ts` / `*.spec.tsx` - Specification tests

## Testing Patterns Used

### Basic Structure

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("ModuleName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("functionName", () => {
    it("should do something specific", () => {
      // test implementation
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Module Mocking with `vi.mock()`

```typescript
vi.mock("module-to-mock", () => ({
  default: {
    functionName: vi.fn(() => "mocked_value"),
  },
}));
```

### Advanced Mocking with `vi.hoisted()`

Used when mocks need to be referenced before `vi.mock()` is called:

```typescript
const { mockSelect, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn(() => Promise.resolve({ data: [], error: null }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  return { mockSelect, mockFrom };
});

vi.mock("@/lib/supabaseClient", () => ({
  supabaseAdmin: {
    from: mockFrom,
  },
}));
```

### Mocking with `vi.fn()`

```typescript
// Create mock functions
const mockFn = vi.fn(() => "mocked_result");

// Mock with implementation
const mockFnWithImpl = vi.fn((arg: string) => `processed_${arg}`);

// Mock rejection
vi.mocked(decodeFingerprint).mockRejectedValue(new Error("Decode error"));

// Mock resolved value
vi.mocked(decodeFingerprint).mockResolvedValue({ fingerprintData: mockData });
```

### Async/Await Testing

```typescript
it("should handle async operations", async () => {
  const result = await asyncFunction();
  expect(result).toEqual(expectedValue);
});
```

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
vitest

# Generate coverage report
npm run coverage:open
```

## Testing Libraries

- [@testing-library/react](https://testing-library.com/react) - React component testing
- [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) - DOM assertion extensions
- [@vitest/coverage-v8](https://vitest.dev/guide/coverage.html) - Code coverage with V8

## Example Test Files

- [`lib/__tests__/helpers/users/jwt.test.ts`](lib/__tests__/helpers/users/jwt.test.ts) - JWT helper tests with mocking
- [`lib/__tests__/helpers/users/password.test.ts`](lib/__tests__/helpers/users/password.test.ts) - Password hashing tests
- [`lib/__tests__/database/parties/getAllParties.test.ts`](lib/__tests__/database/parties/getAllParties.test.ts) - Database tests with `vi.hoisted()`
