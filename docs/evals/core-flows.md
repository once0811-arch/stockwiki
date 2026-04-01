# Core Flow Evals

## Purpose

Phase 별로 반드시 검증해야 할 핵심 사용자 흐름을 정리한다.

## Phase 0

- workspace bootstrap succeeds
- fake adapters compile and are importable
- web health route returns an `ok` payload
- api health endpoint returns an `ok` payload
- one unit test and one smoke/e2e placeholder test pass

## Phase 1

- public stock page SSR renders from fixture market data for multiple tickers
- page displays approved wiki content from `FakeWikiEngine`
- discussion preview placeholder is visible
- canonical metadata is set for reviewed pages
- visible noindex route renders while remaining excluded from indexing
- missing stock route returns the Next.js not-found page
- Playwright public read smoke covers reviewed, stale snapshot, noindex, and not-found scenarios

## Phase 2

- `FakeWikiEngine` keeps public render pinned to approved revision while latest pending revision appears in history
- `/stocks/[market]/[ticker]/history` renders revision id, summary, author, time, and status
- `/stocks/[market]/[ticker]/diff/[from]...[to]` renders a basic approved-vs-latest diff shell
- recent changes sync copies revision metadata into app shadow records without direct MediaWiki DB access
- `MediaWikiEngine` remains an official-API-only skeleton until real integration phase

## Phase 3

- `/stocks/[market]/[ticker]/edit` gates anonymous, member, contributor, and reviewer access according to the fake-first role harness
- anonymous edit entry can continue through the demo login shell before returning with a role-scoped session
- contributor edit submission requires an edit summary and proposed content
- `POST /api/wiki/edit-intents` creates a pending edit draft without changing the public approved render
- pending edit submission becomes visible in revision history and pending revision counts
- `/review/mod-queue` exposes pending proposals, diff preview links, and approve/reject actions for reviewer users
- reviewer approval updates the public approved render and emits a reputation event
- reviewer rejection keeps the public render unchanged while history records the rejected status

## Phase 4

- `/stocks/[market]/[ticker]/edit` shows citation-required sections, source tier guidance, and citation helper inputs
- source policy evaluation flags missing required citations, low-tier sources, and outdated sources before review
- source-less contentious edits are prioritized in `/review/mod-queue` with `no_citation` reasons
- public stock pages render trust/source guidance and approved revision references without breaking approved-render pinning
- history/diff pages expose citation counts and source policy states per revision
- worker dead-link scan skeleton classifies citation URLs as reachable, dead, or skipped

## Contract Eval Targets

### WikiEngine

- create/update
- history
- diff
- rollback
- protect
- reviewed content access

### MarketDataProvider

- quote
- company profile
- filings
- corporate actions
- missing key fallback
