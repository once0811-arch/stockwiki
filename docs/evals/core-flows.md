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
