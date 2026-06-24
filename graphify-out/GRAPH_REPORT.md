# Graph Report - src  (2026-06-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 281 nodes · 415 edges · 29 communities (19 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `981defd5`
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

## God Nodes (most connected - your core abstractions)
1. `isAuthorized()` - 16 edges
2. `useAuth()` - 15 edges
3. `usePartiesContext()` - 11 edges
4. `Button()` - 10 edges
5. `requireAuth()` - 10 edges
6. `useUiContext()` - 9 edges
7. `Input()` - 7 edges
8. `PromisesView()` - 5 edges
9. `AdminProtectedRoute()` - 5 edges
10. `VotePage()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `VotePage()` --calls--> `useAuth()`  [INFERRED]
  app/[locale]/parliament/[id]/page.tsx → context/authContext.tsx
- `VotePage()` --calls--> `useUiContext()`  [INFERRED]
  app/[locale]/parliament/[id]/page.tsx → context/uiContext.tsx
- `Login()` --calls--> `useAuth()`  [EXTRACTED]
  app/[locale]/login/page.tsx → context/authContext.tsx
- `Promises()` --calls--> `useAuth()`  [EXTRACTED]
  app/[locale]/profile/page.tsx → context/authContext.tsx
- `Register()` --calls--> `useAuth()`  [EXTRACTED]
  app/[locale]/register/page.tsx → context/authContext.tsx

## Import Cycles
- 1-file cycle: `middleware.ts -> middleware.ts`

## Communities (29 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): DELETE(), log, POST(), isAuthorized(), mockCookies, mockFindUserByName, mockVerifyJWT, GET() (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (18): Button(), ImputProps, ImputProps, Navbar(), Popup(), Props, AuthContext, AuthProvider() (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (8): AlignmentData, CellData, Props, { Link, redirect, usePathname, useRouter, getPathname }, routing, config, SubjectCard(), SubjectCardProps

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (12): AdminPanel(), Props, AdminProtectedRoute(), Toast(), ToastProps, ToastParams, UiContext, UiContextType (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (8): ExtendedAnalysis, PromisesWithAnalysisList(), PromisesWithAnalysisListProps, PromiseWithAnalysisCardProps, StatusBadge(), StatusBadgeProps, TemaPromiseCard(), TemaPromiseCardProps

### Community 5 - "Community 5"
Cohesion: 0.27
Nodes (11): FormWrapper, FormWrapperProps, ImputProps, Input(), CampaignForm(), PartyForm(), PromiseForm(), ManagePartiesContent() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (11): log, POST(), log, POST(), requireAuth(), mockCookies, mockVerifyJWT, log (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (11): log, POST(), sanitizeName(), existingUser, mockCalculateSimilarity, mockCookies, mockCreateJWT, mockFindFingerprintsForUser (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.19
Nodes (7): ExpandableText(), ExpandableTextProps, MemoizedExpandableText, options, Props, SugestedSearch(), MemoizedVoteCard

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (7): ImputProps, getProposalType(), log, PROPOSAL_TYPE_MAP, STATUS_LABEL_KEYS, STATUS_STYLES, VotePage()

### Community 10 - "Community 10"
Cohesion: 0.20
Nodes (9): POST(), sanitizeName(), mockCookies, mockCreateJWT, mockFindSimilarFingerprint, mockFindUserByName, mockPasswordHash, mockSaveFingerprint (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (6): GET(), log, mockCookies, mockDelete, mockFindUserByName, mockVerifyJWT

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): DashboardStats(), DashboardStatsData, DashboardStatsProps, colorStyles, StatCard(), StatCardProps

### Community 13 - "Community 13"
Cohesion: 0.40
Nodes (3): GET(), log, mockSearch

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (3): mockGetAllProposals, GET(), log

### Community 15 - "Community 15"
Cohesion: 0.60
Nodes (4): GET(), getPosition(), normalizeVotes(), VoteEntry

## Knowledge Gaps
- **92 isolated node(s):** `mockGetAllProposals`, `mockSearch`, `mockCookies`, `mockVerifyJWT`, `mockFindUserByName` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Community 1` to `Community 9`, `Community 3`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 1` to `Community 8`, `Community 5`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `useUiContext()` connect `Community 3` to `Community 9`, `Community 5`, `Community 1`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `mockGetAllProposals`, `mockSearch`, `mockCookies` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0989247311827957 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11954022988505747 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10144927536231885 - nodes in this community are weakly interconnected._