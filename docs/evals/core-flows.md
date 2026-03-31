# Core Flow Evals

## Purpose

Phase 별로 반드시 검증해야 할 핵심 사용자 흐름을 정리한다.

## Phase 0

- workspace bootstrap succeeds
- fake adapters compile and are importable
- web health route returns an `ok` payload
- api health endpoint returns an `ok` payload
- one unit test and one smoke/e2e placeholder test pass

## Phase 1 Preview

- public stock page SSR renders from fixture market data
- page displays approved wiki content from `FakeWikiEngine`
- discussion preview placeholder is visible
- canonical metadata is set

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
