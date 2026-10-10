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

## Promise Extraction from Campaign PDFs

Admins can draft a campaign's promises with AI from **Admin → Manage parties → "Generar promesas con IA"**.

```
POST /api/parties/campaigns/extract-promises { campaign_id }   (admin only, nothing saved)
  → fetchCampaignPdf(campaign.campaign_pdf_url)   lib/services/ai/fetchCampaignPdf.ts
  → extractPromisesFromPdf(pdf, subjects)         lib/services/ai/extractPromisesAI.ts
  → [{ subject_id, subject_name, promises[] }]    max 5 per subject
admin reviews/edits drafts in AiPromisesExtractor
POST /api/parties/promises/bulk { party_id, campaign_id, promises[] }  → single insert
```

- **Input**: the direct link to the program PDF stored on the campaign. The server downloads it; nothing is uploaded.
- **Limits**: links that aren't a PDF (`NOT_PDF`, checked by the `%PDF` header), are over 20 MB (`TOO_LARGE`), invalid (`INVALID_URL`) or unreachable (`DOWNLOAD_FAILED`) are rejected before calling Gemini. The UI shows a translated message per code.
- **Subjects**: the AI only classifies into the existing `subjects` rows; unknown ids are dropped and each subject is capped at 5 promises in code (`normalizeExtraction`).
- **Output**: Gemini JSON mode (`responseMimeType` + `responseSchema`), using `GEMINI_MODEL_ENDPOINT`.
