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
