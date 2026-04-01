# ADR 0007: Phase 6 Search Shell

- Status: Accepted
- Date: 2026-04-01
- Decision Makers: User, Codex

## Context

Phase 6 의 목표는 ticker, canonical title, alias, discussion title 기준으로
빠르게 찾을 수 있는 public search shell 을 만드는 것이다.
PRD 는 다음을 요구한다.

- `/search`
- `GET /api/public/search?q=`
- exact ticker 우선
- alias support
- reviewed-content-first ranking
- indexing pipeline skeleton
- indexing lag metric surface

Phase 5 까지 저장소는 stock page header 에 placeholder search input 만 있었고,
실제 query contract 나 public search route 는 없었다.
real OpenSearch adapter, persistent index, watcher/notification 까지 한 번에 붙이면
fake-first Phase 6 첫 구현 범위를 넘어선다.

## Decision

Phase 6 에서는 다음 fake-first shell 을 채택한다.

1. search contract 는 shared type 으로 `@stockwiki/domain` 에 둔다.
   - lag metric 과 indexing event/sync result 는 web 과 workers 가 같은 타입을 읽는다.
2. public search read model 은 `apps/web/src/search` app-layer feature 로 둔다.
   - fixture market profiles, stock page seed state, discussion store 를 조합해 result 를 만든다.
3. public stock search 는 `indexable` reviewed content 만 stock result 로 노출한다.
   - visible noindex page 는 public search stock result 에서 제외한다.
4. result ranking 은 exact ticker -> canonical title -> alias -> title -> discussion group 순으로 고정한다.
5. indexing pipeline 은 real OpenSearch 대신 fixture-backed event stream 과 lag snapshot 으로 먼저 닫는다.

## Consequences

### Positive

- `/search` page 와 public JSON API 가 같은 read model 을 읽으므로 contract drift 가 줄어든다.
- stock page, workers, fixtures 가 같은 search lag/event contract 를 공유한다.
- Phase 7 watchlist/notification 이 읽을 searchable page boundary 가 생긴다.

### Negative

- real OpenSearch index, autocomplete infra, typo correction 은 아직 없다.
- alias 와 indexing event stream 은 fixture seed 와 in-memory state 에만 존재한다.
- public search result set 은 stock/discussion shell 범위로 제한된다.

## Rejected Alternatives

### 1. `/search` 없이 stock page header input 만 실제 동작시키기

기각 이유:
- PRD 의 public route 와 API contract 를 고정하지 못한다.
- exact ticker / alias / discussion grouping 검증이 약해진다.

### 2. Phase 6 에 real OpenSearch adapter 를 바로 도입하기

기각 이유:
- fake-first 진행성을 해친다.
- persistence, worker workflow, infra tuning 을 함께 열게 되어 slice 범위가 커진다.
