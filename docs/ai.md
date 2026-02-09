# AI Integration

## Gemini 1.5 Flash API

### Entry Point

[`analyzePromisesWithGemini()`](lib/services/geminiClient.ts:7)

### Configuration

- **Model**: Gemini 1.5 Flash
- **Language**: Spanish prompts
- **Output**: Strict JSON format
- **Rate limiting**: 10s backoff on rate limit errors

## Analysis Flow

```
aiPromiseAnalizer()
  → fetch parties/campaigns
  → call Gemini
  → return analysis
```

## Key File

[`lib/services/geminiClient.ts`](lib/services/geminiClient.ts) - AI analysis with Spanish prompts
