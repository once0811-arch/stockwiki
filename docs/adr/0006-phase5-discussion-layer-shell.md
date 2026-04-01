# ADR 0006: Phase 5 Discussion Layer Shell

- Status: Accepted
- Date: 2026-04-01
- Decision Makers: User, Codex

## Context

Phase 5 의 목표는 정본 위키 본문과 분리된 토론 레이어를 제공하는 것이다.
PRD 는 다음을 요구한다.

- thread list/create
- comment/reply
- helpful vote
- report comment
- pin/lock
- section-anchor linking
- article page discussion summary 노출

Phase 4 까지 저장소는 stock page 하단에 placeholder discussion preview 만 있었다.
real auth, persistent app DB, dedicated admin queue, search indexing 을 한 번에 붙이면
Phase 5 첫 구현 범위를 넘어서게 된다.

## Decision

Phase 5 에서는 다음 fake-first shell 을 채택한다.

1. 토론 도메인은 `apps/web/src/discussion` app-layer feature 로 분리한다.
   - canonical article revision 과 discussion thread/comment/report state 를 섞지 않는다.
2. `/stocks/[market]/[ticker]/discussion` route 는 fixture-backed thread list, create form,
   comment/reply flow, helpful vote, report, reviewer pin/lock 을 직접 제공한다.
3. discussion state 는 in-memory singleton store 와 deterministic seed fixtures 로 유지한다.
4. section-anchor linking 은 Phase 4 citation section policy ids 를 재사용해 article section 과 연결한다.
5. stock page summary 는 placeholder seed 가 아니라 discussion read model 을 직접 읽는다.

## Consequences

### Positive

- 정본 본문과 의견 토론이 분리된다는 제품 원칙을 코드와 테스트로 고정할 수 있다.
- Phase 3/4 fake session, reviewer workflow, citation section policy 와 자연스럽게 이어진다.
- Phase 6 search 와 Phase 7 notification 이 읽을 discussion read model 경계가 생긴다.

### Negative

- discussion threads, comments, reports, moderation state 는 process memory 에만 존재한다.
- report handling 은 comment status marking 과 reviewer pin/lock shell 수준에 머무른다.
- authenticated API, admin queue, audit log, notifications 는 later phase 로 남는다.

## Rejected Alternatives

### 1. Discussion 을 canonical wiki revision 안에 같이 저장

기각 이유:
- 사실 서술과 의견 서술을 분리한다는 제품 원칙에 어긋난다.
- approved public render gating 과 discussion participation 흐름이 불필요하게 결합된다.

### 2. MediaWiki discussion tooling 을 Phase 5 에 바로 채택

기각 이유:
- fake-first 진행성을 해친다.
- real MediaWiki integration phase 가 오기 전에 discussion UX 와 moderation shell 검증이 막힌다.
