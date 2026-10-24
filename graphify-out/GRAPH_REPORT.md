# Graph Report - Demosratio  (2026-10-24)

## Corpus Check
- 242 files · ~64,820 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 5, .example 1, .ico 1)

## Summary
- 1065 nodes · 2765 edges · 62 communities (53 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 83 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3e06bea9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- isAuthorized
- proposal.types.ts
- next-intl
- politicalParties.ts
- temas/[id]/page.tsx
- package.json
- react
- legislaturaContext.tsx
- parliament/[id]/page.tsx
- Demosratio
- dislike/route.ts
- compilerOptions
- signin.test.ts
- promisesAnaliseAI.ts
- fingerprint-gen.tsx
- jwt.ts
- initiativeLookup.ts
- supabaseClient.ts
- signup.test.ts
- campaigns/route.ts
- extractPromisesAI.ts
- parliament-data/route.ts
- Demosratio - AI Coding Agent Guide
- resolveLegislaturaId
- services/proposalSummary.ts
- AI Integration
- dependencies
- helpers/legislatura.ts
- API Routes
- Testing
- Quick Reference
- proposalSummaryAI.ts
- Architecture Overview
- Authentication
- Toast Notifications
- Internationalization
- Testing Patterns Used
- readiness/route.ts
- eslint.config.mjs
- promise-analysis.test.ts
- geminiRequest.ts
- uiContext.tsx
- next
- extract-promises/route.ts
- scripts
- locale.ts
- CLAUDE.md
- .claude/CLAUDE.md
- tslog
- password.ts
- postcss.config.mjs
- getProposalById.ts
- vercel.json
- globals.d.ts
- LegislaturasManager.tsx
- DashboardStats.tsx
- @testing-library/jest-dom
- getLegislaturas.ts
- getAllPromiseAnalysesByParty.ts
- addUserLike.ts
- postcss@^8

## God Nodes (most connected - your core abstractions)
1. `tslog` - 95 edges
2. `next` - 64 edges
3. `supabaseAdmin` - 51 edges
4. `next-intl` - 46 edges
5. `vitest` - 44 edges
6. `react` - 42 edges
7. `isAuthorized()` - 38 edges
8. `useRequest()` - 30 edges
9. `useLegislatura()` - 26 edges
10. `Button()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Data Fetching from Components` --references--> `useRequest()`  [INFERRED]
  docs/api.md → hooks/use-request.tsx
- `Key Patterns` --references--> `useRequest()`  [INFERRED]
  .github/copilot-instructions.md → hooks/use-request.tsx
- `External Data` --references--> `extractParliamentJson()`  [INFERRED]
  docs/auth.md → lib/helpers/spanishParliamentExtractor/getParliamentData.ts
- `Configuration` --references--> `geminiFetch()`  [INFERRED]
  docs/ai.md → lib/services/ai/geminiRequest.ts
- `Entry Point` --references--> `analyzePromisesWithGemini()`  [INFERRED]
  docs/ai.md → lib/services/geminiClient.ts

## Import Cycles
- None detected.

## Communities (62 total, 9 thin omitted)

### Community 0 - "isAuthorized"
Cohesion: 0.09
Nodes (38): fetchLegislaturas(), deleteLegislatura(), log, saveLegislatura(), setCurrentLegislatura(), updateLegislatura(), log, NewPromise (+30 more)

### Community 1 - "proposal.types.ts"
Cohesion: 0.20
Nodes (10): buildExpedientText(), hasSubGroup(), log, mergeVotesByParty(), base, PromiseAnalysisStatus, ProposalData, ProposalInfo (+2 more)

### Community 2 - "next-intl"
Cohesion: 0.19
Nodes (9): next-intl, Home(), LpCard(), Props, getPathname, redirect, routing, usePathname (+1 more)

### Community 3 - "politicalParties.ts"
Cohesion: 0.14
Nodes (27): log, ImputProps, PartiesContext, PartiesContextType, AnalysisItem(), ExtendedAnalysis, PromisesWithAnalysisList(), PromisesWithAnalysisListProps (+19 more)

### Community 4 - "temas/[id]/page.tsx"
Cohesion: 0.15
Nodes (29): withLegislatura(), AlignmentData, AlignmentMatrix(), AlignmentPage(), CellData, getCellStyle(), LegendGradient(), Parliament() (+21 more)

### Community 5 - "package.json"
Cohesion: 0.08
Nodes (35): devDependencies, eslint@^9, eslint-config-next@15.1.6, husky@^9.1.7, jsdom@^28.1.0, supabase@^2.75.5, tailwindcss@^3.4.1, @testing-library/dom@^10.4.1 (+27 more)

### Community 6 - "react"
Cohesion: 0.15
Nodes (35): log, RequestProps, useRequest(), axios, react, Login(), Promises(), Register() (+27 more)

### Community 7 - "legislaturaContext.tsx"
Cohesion: 0.12
Nodes (23): State Management, legislaturaLabel(), metadata, roboto, robotoSerif, RootLayout(), LegislaturaSelect(), LegislaturaBanner() (+15 more)

### Community 8 - "parliament/[id]/page.tsx"
Cohesion: 0.09
Nodes (29): formatDate(), getDateString(), getFormattedDateForDB(), log, normalizeWrongSpanishDate(), getProposalType(), log, PROPOSAL_TYPE_MAP (+21 more)

### Community 9 - "Demosratio"
Cohesion: 0.07
Nodes (28): Base de Datos, Contacto, Contribución, Convención de branching, Creadores, ¿Cómo funciona?, Demosratio, Branching convention (+20 more)

### Community 10 - "dislike/route.ts"
Cohesion: 0.14
Nodes (20): fetchUserLikesAndDislikes(), log, addUserDislike(), deleteUserDislike(), log, deleteUserLike(), log, getUserDislikes() (+12 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "signin.test.ts"
Cohesion: 0.12
Nodes (22): SIMILARITY_THRESHOLD, STORAGE_KEY, calculateSimilarity(), findFingerprint(), findFingerprintsForUser(), findSimilarFingerprint(), log, saveFingerprint() (+14 more)

### Community 13 - "promisesAnaliseAI.ts"
Cohesion: 0.13
Nodes (17): fetchAllParties(), log, aiPromiseAnalizer(), fetchPartiesToAnalyse(), log, NoPromisesToAnalyseError, analyzePromisesWithGemini(), log (+9 more)

### Community 14 - "fingerprint-gen.tsx"
Cohesion: 0.20
Nodes (11): generateAdditionalFingerprint(), generateCanvasFingerprint(), generateWebglFingerprint(), log, useFingerprint(), encodeFingerprint(), log, { mockCreateDecipheriv, mockUpdate } (+3 more)

### Community 15 - "jwt.ts"
Cohesion: 0.12
Nodes (17): createJWT(), log, verifyJWT(), jsonwebtoken, GET(), log, DELETE(), log (+9 more)

### Community 16 - "initiativeLookup.ts"
Cohesion: 0.16
Nodes (23): buildInitiativeDetailUrl(), buildSearchQuery(), cleanExpedientText(), contentWords(), EMPTY_SEARCH_RETRY_MS, expectedInitiativePrefixes(), extractFirstBocgUrl(), fetchInitiativePdfUrl() (+15 more)

### Community 17 - "supabaseClient.ts"
Cohesion: 0.16
Nodes (15): log, deletePromise(), log, fetchPartyPromises(), log, fetchStructuredPartyPromises(), log, log (+7 more)

### Community 18 - "signup.test.ts"
Cohesion: 0.14
Nodes (17): deleteUser(), findUserByName(), log, saveUser(), User, UserDevice, { mockFrom, mockSingle }, NotFoundError (+9 more)

### Community 19 - "campaigns/route.ts"
Cohesion: 0.14
Nodes (16): deleteCampaign(), log, fetchAllCampaigns(), log, fetchCampaign(), log, log, saveCampaign() (+8 more)

### Community 20 - "extractPromisesAI.ts"
Cohesion: 0.16
Nodes (15): extractPromisesFromPdf(), getUrlRetrievalStatuses(), log, MAX_PROMISES_PER_SUBJECT, normalizeExtraction(), PdfNotReadError, RawExtraction, UrlContextCandidate (+7 more)

### Community 21 - "parliament-data/route.ts"
Cohesion: 0.21
Nodes (16): ensureLegislaturaExists(), deleteProposal(), log, checkLegacySubGroupProposalExists(), checkProposalExists(), log, saveProposalToDb(), extractParliamentDataForDay() (+8 more)

### Community 22 - "Demosratio - AI Coding Agent Guide"
Cohesion: 0.25
Nodes (8): Core Stack, Demosratio - AI Coding Agent Guide, Documentation, Essentials, Features, Important, Key Files, Quick Reference

### Community 23 - "resolveLegislaturaId"
Cohesion: 0.07
Nodes (33): Client-side, Database Clients, Database Guide, Helper Functions, Key Helpers, Legislaturas, Schema Overview, Server-side (API Routes) (+25 more)

### Community 24 - "services/proposalSummary.ts"
Cohesion: 0.18
Nodes (15): getProposalsMissingSummary(), log, saveProposalSummary(), buildProposalSummary(), log, ProposalSummaryUpdate, ProposalToSummarize, es (+7 more)

### Community 25 - "AI Integration"
Cohesion: 0.25
Nodes (8): AI Integration, Analysis Flow, Configuration, Entry Point, Gemini API, Key File, Plain-language vote summaries, Promise Extraction from Campaign PDFs

### Community 26 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, axios@^1.8.1, chart.js@^4.4.8, js-cookie@^3.0.5, @js-temporal/polyfill@^0.4.4, jsonwebtoken@^9.0.2, next@^15.1.9, next-intl@^3.26.3 (+11 more)

### Community 27 - "helpers/legislatura.ts"
Cohesion: 0.20
Nodes (12): DEFAULT_LEGISLATURA_ID, intToRoman(), ROMAN_VALUES, romanToInt(), buildVotacionesUrl(), DEFAULT_LEGISLATURA, extractParliamentJson(), extractParliamentZip() (+4 more)

### Community 28 - "API Routes"
Cohesion: 0.17
Nodes (12): AI Promise Extraction, API Routes, Data Fetching from Components, Examples, Legislatura scoping, Legislaturas, Parties and campaigns (admin), Pending promise analysis (+4 more)

### Community 29 - "Testing"
Cohesion: 0.29
Nodes (7): Example Test Files, Framework, Running Tests, Test File Naming, Test File Patterns, Testing, Testing Libraries

### Community 30 - "Quick Reference"
Cohesion: 0.22
Nodes (8): Commands, Database Schema, Demosratio - Copilot Instructions, Example API Route, Important Files, Key Patterns, Quick Reference, Tech Stack

### Community 31 - "proposalSummaryAI.ts"
Cohesion: 0.17
Nodes (14): buildSummaryPrompt(), cleanField(), GEMINI_DEADLINE_MS, LOCALE_NAMES, log, normalizeSummary(), summarizeProposalFromPdf(), SUMMARY_LOCALES (+6 more)

### Community 32 - "Architecture Overview"
Cohesion: 0.33
Nodes (5): Architecture Overview, Client Components, Directory Structure, Key Patterns, Root Layout

### Community 33 - "Authentication"
Cohesion: 0.33
Nodes (5): Auth Hook, Authentication, Configuration, Custom JWT Auth, External Data

### Community 34 - "Toast Notifications"
Cohesion: 0.40
Nodes (4): Components & UI, Show a Toast, Toast Notifications, Toast Variants

### Community 35 - "Internationalization"
Cohesion: 0.33
Nodes (5): In Pages, Internationalization, Setup, Translation Files, Usage

### Community 36 - "Testing Patterns Used"
Cohesion: 0.33
Nodes (6): Advanced Mocking with `vi.hoisted()`, Async/Await Testing, Basic Structure, Mocking with `vi.fn()`, Module Mocking with `vi.mock()`, Testing Patterns Used

### Community 37 - "readiness/route.ts"
Cohesion: 0.19
Nodes (11): getPromisesReadiness(), log, getuserPromisesReadiness(), log, log, setPromisesReadiness(), log, updatePromisesReadiness() (+3 more)

### Community 38 - "eslint.config.mjs"
Cohesion: 0.12
Nodes (11): compat, __dirname, eslintConfig, __filename, __dirname, __filename, server, @eslint/eslintrc@^3 (+3 more)

### Community 40 - "promise-analysis.test.ts"
Cohesion: 0.25
Nodes (11): log, setPromiseAnalysis(), countProposalsPendingAnalysis(), getProposalsPendingAnalysis(), log, markPromiseAnalysisDone(), PendingProposal, GET() (+3 more)

### Community 41 - "geminiRequest.ts"
Cohesion: 0.20
Nodes (12): DEFAULT_MIN_INTERVAL_MS, DEFAULT_RATE_LIMIT_WAIT_MS, geminiFetch(), GeminiFetchOptions, log, MAX_RATE_LIMIT_WAIT_MS, minInterval(), parseRetryDelayMs() (+4 more)

### Community 42 - "uiContext.tsx"
Cohesion: 0.21
Nodes (10): ManageParties(), Admin(), AdminPanel(), Props, AdminProtectedRoute(), Toast(), ToastProps, ToastParams (+2 more)

### Community 43 - "next"
Cohesion: 0.06
Nodes (34): getDislikesCount(), log, fetchAllLikesAndDislikes(), log, getLikesCount(), log, DashboardStats, getDashboardStats() (+26 more)

### Community 44 - "extract-promises/route.ts"
Cohesion: 0.23
Nodes (9): fetchCampaignById(), fetchAllsubjects(), log, { mockSelect, mockFrom }, mockSubjects, isHttpUrl(), log, POST() (+1 more)

### Community 45 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, coverage:open, dev, dev:infisical, graph:update, graph:watch, lint (+3 more)

### Community 49 - "tslog"
Cohesion: 0.33
Nodes (7): getPromiseAnalysisByPromise(), log, getPromiseAnalysisByCampaign(), log, tslog, GET(), log

### Community 50 - "password.ts"
Cohesion: 0.36
Nodes (3): constantTimeEqual(), Password, scryptAsync

### Community 52 - "getProposalById.ts"
Cohesion: 0.36
Nodes (5): getProposalById(), log, { mockSingleProposal, mockEqPromises, mockFrom }, GET(), log

### Community 55 - "LegislaturasManager.tsx"
Cohesion: 0.36
Nodes (7): DATE_FIELDS, DateField, Draft, emptyDraft(), LegislaturasManager(), toBody(), toDraft()

### Community 56 - "DashboardStats.tsx"
Cohesion: 0.32
Nodes (6): DashboardStats(), DashboardStatsData, DashboardStatsProps, colorStyles, StatCard(), StatCardProps

### Community 58 - "getLegislaturas.ts"
Cohesion: 0.47
Nodes (4): fetchCurrentLegislaturaId(), log, envLegislaturaId(), { mockMaybeSingle, mockFrom }

### Community 59 - "getAllPromiseAnalysesByParty.ts"
Cohesion: 0.47
Nodes (4): getAllPromiseAnalysesByParty(), log, GET(), log

### Community 60 - "addUserLike.ts"
Cohesion: 0.50
Nodes (3): addUserLike(), log, { mockInsert, mockSingle, mockFrom }

## Knowledge Gaps
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `tslog` connect `tslog` to `isAuthorized`, `proposal.types.ts`, `politicalParties.ts`, `package.json`, `react`, `legislaturaContext.tsx`, `parliament/[id]/page.tsx`, `dislike/route.ts`, `signin.test.ts`, `promisesAnaliseAI.ts`, `fingerprint-gen.tsx`, `jwt.ts`, `initiativeLookup.ts`, `supabaseClient.ts`, `signup.test.ts`, `campaigns/route.ts`, `extractPromisesAI.ts`, `parliament-data/route.ts`, `resolveLegislaturaId`, `services/proposalSummary.ts`, `dependencies`, `helpers/legislatura.ts`, `proposalSummaryAI.ts`, `readiness/route.ts`, `promise-analysis.test.ts`, `geminiRequest.ts`, `next`, `extract-promises/route.ts`, `getProposalById.ts`, `getLegislaturas.ts`, `getAllPromiseAnalysesByParty.ts`, `addUserLike.ts`?**
  _High betweenness centrality (0.280) - this node is a cross-community bridge._
- **Should `isAuthorized` be split into smaller, more focused modules?**
  _Cohesion score 0.09361393323657474 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `isAuthorized`, `next-intl`, `politicalParties.ts`, `temas/[id]/page.tsx`, `package.json`, `react`, `legislaturaContext.tsx`, `parliament/[id]/page.tsx`, `dislike/route.ts`, `signin.test.ts`, `jwt.ts`, `supabaseClient.ts`, `signup.test.ts`, `campaigns/route.ts`, `parliament-data/route.ts`, `resolveLegislaturaId`, `services/proposalSummary.ts`, `dependencies`, `readiness/route.ts`, `promise-analysis.test.ts`, `uiContext.tsx`, `extract-promises/route.ts`, `tslog`, `getProposalById.ts`, `getAllPromiseAnalysesByParty.ts`?**
  _High betweenness centrality (0.215) - this node is a cross-community bridge._
- **Should `politicalParties.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `next` to `isAuthorized`, `proposal.types.ts`, `package.json`, `parliament/[id]/page.tsx`, `dislike/route.ts`, `signin.test.ts`, `promisesAnaliseAI.ts`, `fingerprint-gen.tsx`, `jwt.ts`, `initiativeLookup.ts`, `signup.test.ts`, `extractPromisesAI.ts`, `parliament-data/route.ts`, `services/proposalSummary.ts`, `helpers/legislatura.ts`, `proposalSummaryAI.ts`, `eslint.config.mjs`, `promise-analysis.test.ts`, `geminiRequest.ts`, `extract-promises/route.ts`, `password.ts`, `getProposalById.ts`, `getLegislaturas.ts`, `addUserLike.ts`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Should `temas/[id]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14935988620199148 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07657657657657657 - nodes in this community are weakly interconnected._