# AI Integration

## Gemini API

### Entry Point

[`analyzePromisesWithGemini()`](lib/services/geminiClient.ts:7)

### Configuration

- **Model**: set by `GEMINI_MODEL_ENDPOINT` (e.g. `.../models/gemini-3.6-flash:generateContent`). It must be a Gemini 3 model that accepts `thinkingLevel: "minimal"` (gemini-3.8-flash doesn't; its lowest level is `low`).
- **Language**: Spanish prompts
- **Output**: Strict JSON format (`responseMimeType: application/json`)
- **Speed**: `MINIMAL_THINKING` in `lib/services/ai/geminiConfig.ts` (`thinkingLevel: "minimal"`) is used by both Gemini calls. Gemini 3 can't turn thinking off; this is the lowest level. No temperature/topP/topK overrides, since Gemini 3 works best with defaults.
- **Rate limiting**: every Gemini call goes through `geminiFetch()` (`lib/services/ai/geminiRequest.ts`). It keeps calls at least 12s apart (free tier: 5 requests per minute per model; set `GEMINI_MIN_INTERVAL_MS=0` on a paid plan), waits the `retryDelay` Gemini sends with a 429, and retries 500/503 after 5s/15s/30s. A 429 asking for more than 90s means the daily quota is used up, so it gives up.
- **Importer**: `/api/cron/parliament-data` analyses promises *before* saving a vote, so a failed analysis leaves nothing saved and the next run retries it. It stops starting new votes after 160s (route `maxDuration` is 300s) and stops the whole run on a rate limit; unprocessed votes are picked up by the next run.

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

## Plain-language vote summaries

Each vote card can show "En pocas palabras": what was voted, what a Yes means and what a No means.
The summary is written **only from the official text** of the initiative, never from the one-line vote description.

```
GET /api/cron/proposal-summaries[?limit=N]   (cron 01:00 daily, or admin / CRON_SECRET)
  → getProposalsMissingSummary(limit)          status null or "error", newest first
  → lookupInitiative(expedient_text, url)      lib/helpers/spanishParliamentExtractor/initiativeLookup.ts
      congreso.es initiative search (JSON) → pick the one clear match → detail page → first BOCG PDF
  → summarizeProposalFromPdf(...)              lib/services/ai/proposalSummaryAI.ts
      Gemini reads the PDF with url_context; result discarded if the PDF wasn't read
  → saveProposalSummary(id, update)            columns initiative_id, initiative_pdf_url, plain_summary, plain_summary_status
```

- **Matching**: the vote text is cleaned (type, author, point label removed) and its first 8 meaningful words are searched. Words like "y", "o", "no" are never sent: they are operators in Congreso's search. A result is accepted only if it has the expected initiative type (e.g. `173/` for mociones) and is clearly the most similar title. Otherwise the vote gets `no_match` and no summary: better nothing than the wrong initiative.
- **Procedural votes** (deadline extensions, Statute rulings...) are `not_applicable`.
- **Statuses** are listed in `ProposalSummaryStatus` (`types/proposal.types.ts`). Only `null` and `error` are retried.
- **Languages**: `SUMMARY_LOCALES` in `proposalSummaryAI.ts`, kept in sync with `routing.locales` (only `es` today).
- **Backfill**: call the route repeatedly (e.g. `?limit=20`) until `processed` is 0. `SUMMARIES_PER_RUN` sets the default batch (8).
- **Fragility**: the search endpoint is undocumented. Empty answers are retried once; Gemini 429/5xx are retried twice.
- **Migration**: `supabase/migrations/20261021120000_proposal_plain_summary.sql`.
