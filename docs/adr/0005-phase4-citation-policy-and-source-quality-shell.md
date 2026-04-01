# ADR 0005: Phase 4 Citation Policy And Source Quality Shell

- Status: Accepted
- Date: 2026-04-01
- Decision Makers: User, Codex

## Context

Phase 4 는 citation helper UI, source tiering, source presence checks, outdated source warnings,
`no citation` report reason, moderation rule hooks, 그리고 dead-link scan skeleton 을 요구한다.

현재 저장소는 Phase 3 까지 fake-first edit proposal 과 reviewer queue 를 갖췄지만,
revision 별 source metadata 나 policy finding 을 다루는 공통 모델은 아직 없다.
real auth, persistent DB, real MediaWiki ref parsing, external link validation 을 한 번에 붙이면
Phase 4 범위를 넘어서게 된다.

## Decision

Phase 4 는 다음 shell 을 채택한다.

1. revision 별 source metadata 는 `WikiEngine` 계약이 아니라 app-layer revision metadata 로 유지한다.
   - approved fixture revisions 와 pending edit drafts 모두 `changedSectionIds`, `citations`, `policy`, `queuePriority` 를 가진다.
2. `/stocks/[market]/[ticker]/edit` 는 section-based citation helper UI 를 제공한다.
   - 편집자는 변경 섹션을 선택한다.
   - citation helper 는 label / URL / tier / published date / applies-to-section 을 받는다.
3. submission 시 app-layer source policy evaluator 가 다음을 판정한다.
   - required section citation missing
   - section minimum tier 미달
   - 24개월 초과 source warning
4. reviewer queue 는 flagged proposal 을 먼저 보여주고,
   `no_citation` report reason 과 source policy findings 를 함께 노출한다.
5. dead-link scan 은 worker-layer probe-injected skeleton 으로 추가한다.
   - real network policy 와 persistence 는 later phase 로 미룬다.

## Consequences

### Positive

- Phase 3 review workflow 를 유지한 채 Phase 4 신뢰 정책을 한 슬라이스로 얹을 수 있다.
- public page, history, diff, moderation queue 가 같은 revision source metadata 를 읽게 된다.
- dead-link checking 경계가 worker 로 분리돼 later phase 에 real scheduler/persistence 로 확장하기 쉽다.

### Negative

- citation helper 는 fixed-slot form shell 이라 dynamic ref editor 나 MediaWiki ref syntax 를 아직 대체하지 못한다.
- source metadata 와 findings 는 process memory / fixture seed 에만 존재한다.
- dead-link scan 은 probe contract skeleton 이며 real retry, rate limit, persistence 는 없다.

## Rejected Alternatives

### 1. Phase 4 에서 MediaWiki ref parser 와 real citation storage 를 바로 도입

기각 이유:
- fake-first 진행성을 해친다.
- MediaWiki integration phase 와 app DB phase 가 Phase 4 를 막는 blocker 가 된다.

### 2. reviewer queue 에 source policy 를 붙이지 않고 edit form warning 만 추가

기각 이유:
- PRD 의 `source-less contentious edit queue 처리` 종료 조건을 만족하지 못한다.
- reviewer 가 우선순위와 이유 코드를 보는 운영 흐름이 빠진다.
