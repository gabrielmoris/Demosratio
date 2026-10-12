# Graph Report - Demosratio  (2026-06-25)

## Corpus Check
- 229 files · ~140,903 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 794 nodes · 1424 edges · 58 communities (45 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a733d8b7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]

## God Nodes (most connected - your core abstractions)
1. `supabaseAdmin` - 43 edges
2. `useRequest()` - 28 edges
3. `isAuthorized()` - 18 edges
4. `fetchAllLikesAndDislikes()` - 16 edges
5. `findUserByName()` - 16 edges
6. `compilerOptions` - 16 edges
7. `verifyJWT()` - 15 edges
8. `useAuth()` - 15 edges
9. `Demosratio` - 14 edges
10. `Demosratio` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Parliament()` --calls--> `useRequest()`  [EXTRACTED]
  src/app/[locale]/parliament/page.tsx → hooks/use-request.tsx
- `RelatedVoteCard()` --calls--> `formatDate()`  [INFERRED]
  src/app/[locale]/temas/[id]/page.tsx → lib/helpers/dateFormatters.ts
- `VotePage()` --calls--> `formatDate()`  [INFERRED]
  src/app/[locale]/parliament/[id]/page.tsx → lib/helpers/dateFormatters.ts
- `VotePage()` --calls--> `useRequest()`  [INFERRED]
  src/app/[locale]/parliament/[id]/page.tsx → hooks/use-request.tsx
- `POST()` --calls--> `fetchAllLikesAndDislikes()`  [EXTRACTED]
  src/app/api/spanish-proposals/likes/dislike/route.ts → lib/database/likes/getTotalLikesAndDislikes.ts

## Import Cycles
- None detected.

## Communities (58 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (11): isAuthorized(), mockCookies, mockFindUserByName, mockVerifyJWT, deleteSubject(), log, DELETE(), log (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (43): aiPromiseAnalizer(), log, fetchAllCampaigns(), log, getDateString(), getFormattedDateForDB(), log, normalizeWrongSpanishDate() (+35 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (11): AlignmentData, CellData, Props, AuthProvider(), UiProvider(), { Link, redirect, usePathname, useRouter, getPathname }, routing, metadata (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (57): AdminPanel(), Props, AdminProtectedRoute(), GET(), log, Button(), ImputProps, ImputProps (+49 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (16): GET(), log, getSubjectDeepDive(), log, getSubjectsWithStats(), log, GET(), log (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (46): dependencies, axios, chart.js, js-cookie, @js-temporal/polyfill, jsonwebtoken, jszip, next (+38 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (23): log, POST(), log, POST(), fetchUserLikesAndDislikes(), requireAuth(), addUserDislike(), log (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (52): AuthContext, defaultAuthContext, IDefaultAuthContext, log, GET(), log, DELETE(), log (+44 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (23): ImputProps, ExpandableText(), ExpandableTextProps, MemoizedExpandableText, options, Props, SugestedSearch(), MemoizedVoteCard (+15 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (28): Base de Datos, Contacto, Contribución, Convención de branching, Creadores, ¿Cómo funciona?, Demosratio, Branching convention (+20 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): DashboardStats(), DashboardStatsData, DashboardStatsProps, colorStyles, StatCard(), StatCardProps

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (24): getDislikesCount(), log, { mockSelect, mockEq, mockFrom }, fetchAllLikesAndDislikes(), log, getLikesCount(), log, { mockSelect, mockEq, mockFrom } (+16 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (10): log, Fingerprint, WebGLParams, mockFingerprintData1, mockFingerprintData2, decodeFingerprint(), encodeFingerprint(), log (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.39
Nodes (6): GET(), getPosition(), normalizeVotes(), VoteEntry, getProposalsForAlignment(), log

### Community 16 - "Community 16"
Cohesion: 0.19
Nodes (11): getPromisesReadiness(), log, getuserPromisesReadiness(), log, log, setPromisesReadiness(), log, updatePromisesReadiness() (+3 more)

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (13): GET(), log, supabase, supabaseAdmin, log, log, getPromiseAnalysisByPromise(), log (+5 more)

### Community 18 - "Community 18"
Cohesion: 0.21
Nodes (10): deleteCampaign(), log, fetchCampaign(), log, DELETE(), GET(), log, POST() (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.21
Nodes (10): deletePromise(), log, fetchStructuredPartyPromises(), log, DELETE(), GET(), log, POST() (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (8): Core Stack, Demosratio - AI Coding Agent Guide, Documentation, Essentials, Features, Important, Key Files, Quick Reference

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (7): Client-side, Database Clients, Database Guide, Helper Functions, Key Helpers, Schema Overview, Server-side (API Routes)

### Community 24 - "Community 24"
Cohesion: 0.36
Nodes (5): getProposalById(), log, { mockSingleProposal, mockEqPromises, mockFrom }, GET(), log

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (6): AI Integration, Analysis Flow, Configuration, Entry Point, Gemini 1.5 Flash API, Key File

### Community 26 - "Community 26"
Cohesion: 0.60
Nodes (3): GET(), DashboardStats, getDashboardStats()

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (6): API Routes, Data Fetching from Components, Examples, POST with Auth + Body, REST Conventions, Simple GET with Query Params

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (7): Example Test Files, Framework, Running Tests, Test File Naming, Test File Patterns, Testing, Testing Libraries

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (7): Commands, Database Schema, Example API Route, Important Files, Key Patterns, Quick Reference, Tech Stack

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (5): fetchAllsubjects(), log, { mockSelect, mockFrom }, mockSubjects, GET()

### Community 32 - "Community 32"
Cohesion: 0.33
Nodes (5): Architecture Overview, Client Components, Directory Structure, Key Patterns, Root Layout

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (5): Auth Hook, Authentication, Configuration, Custom JWT Auth, External Data

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (5): Components & UI, Show a Toast, State Management, Toast Notifications, Toast Variants

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (5): In Pages, Internationalization, Setup, Translation Files, Usage

### Community 36 - "Community 36"
Cohesion: 0.33
Nodes (6): Advanced Mocking with `vi.hoisted()`, Async/Await Testing, Basic Structure, Mocking with `vi.fn()`, Module Mocking with `vi.mock()`, Testing Patterns Used

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 38 - "Community 38"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 40 - "Community 40"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 41 - "Community 41"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 42 - "Community 42"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **352 isolated node(s):** `husky.sh script`, `__filename`, `__dirname`, `compat`, `eslintConfig` (+347 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabaseAdmin` connect `Community 17` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 13`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 24`, `Community 26`, `Community 31`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `isAuthorized()` connect `Community 0` to `Community 1`, `Community 18`, `Community 19`, `Community 7`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `useRequest()` connect `Community 3` to `Community 8`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `husky.sh script`, `__filename`, `__dirname` to the rest of the system?**
  _352 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06271186440677966 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09420289855072464 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.058796614047128805 - nodes in this community are weakly interconnected._