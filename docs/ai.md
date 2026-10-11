# AI Integration

## Gemini API

### Entry Point

[`analyzePromisesWithGemini()`](lib/services/geminiClient.ts:7)

### Configuration

- **Model**: set by `GEMINI_MODEL_ENDPOINT` (e.g. `.../models/gemini-3.6-flash:generateContent`). It must be a Gemini 3 model that accepts `thinkingLevel: "minimal"` (gemini-3.8-flash doesn't; its lowest level is `low`).
- **Language**: Spanish prompts
- **Output**: Strict JSON format (`responseMimeType: application/json`)
- **Speed**: `MINIMAL_THINKING` in `lib/services/ai/geminiConfig.ts` (`thinkingLevel: "minimal"`) is used by both Gemini calls. Gemini 3 can't turn thinking off; this is the lowest level. No temperature/topP/topK overrides, since Gemini 3 works best with defaults.
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

## Promise Extraction from Campaign PDFs

Admins can draft a campaign's promises with AI from **Admin → Manage parties → "Generar promesas con IA"**.

```
POST /api/parties/campaigns/extract-promises { campaign_id }   (admin only, nothing saved)
  → extractPromisesFromPdf(campaign.campaign_pdf_url, subjects)   lib/services/ai/extractPromisesAI.ts
      Gemini fetches the link itself (url_context tool)
  → [{ subject_id, subject_name, promises[] }]    max 5 per subject
admin reviews/edits drafts in AiPromisesExtractor
POST /api/parties/promises/bulk { party_id, campaign_id, promises[] }  → single insert
```

- **Input**: the direct link to the program PDF stored on the campaign. It goes in the prompt and Gemini fetches it with the `url_context` tool, so our server never downloads the PDF and nothing is stored.
- **Limits**: the link must be public and at most 34 MB (Gemini's URL context limit). A link that isn't http(s) is rejected before calling Gemini (`INVALID_URL`). If Gemini's `urlContextMetadata` has no `URL_RETRIEVAL_STATUS_SUCCESS`, the answer is discarded (`PDF_NOT_READ`), so promises can never come from anything but the program. The UI shows a translated message per code.
- **Requirements**: combining a built-in tool (URL context) with `responseSchema` only works on Gemini 3 models.
- **Debugging**: the raw Gemini answer and its token usage are logged (`Gemini raw extraction:`) before `normalizeExtraction` runs.
- **Subjects**: the AI only classifies into the existing `subjects` rows; unknown ids are dropped and each subject is capped at 5 promises in code (`normalizeExtraction`).
- **Duration**: the extraction route sets `maxDuration = 300`. This needs Fluid compute (`"fluid": true` in `vercel.json`); without it Hobby functions are capped at 60s and the build fails.
- **Output**: Gemini JSON mode (`responseMimeType` + `responseSchema`), using `GEMINI_MODEL_ENDPOINT`.
