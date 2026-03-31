# ADR 0002: Phase 2 Wiki Shadow Metadata And History Read Model

- Status: Accepted
- Date: 2026-03-31
- Decision Makers: User, Codex

## Context

Phase 2 의 목표는 FakeWikiEngine 에서 실제 MediaWiki 연동으로 넘어갈 수 있는 위키 브리지와 리비전 모델을 만드는 것이다.
PRD 는 다음을 명시한다.

- public default revision 은 마지막 approved revision
- history 와 diff UI 가 기본 동작해야 한다
- 앱 DB 는 MediaWiki full revision content 대신 shadow metadata 를 저장한다
- recent changes sync job skeleton 이 필요하다
- MediaWiki DB direct access 는 금지된다

## Decision

Phase 2 에서는 다음 구조를 채택한다.

1. `WikiEngine` 계약은 `getHistory(key, params?)` 를 포함해 history filtering 을 지원한다.
2. `FakeWikiEngine` 는 approved/pending revision gating, history, diff, recent changes 를 deterministic 하게 제공한다.
3. `apps/web` 는 public stock page 에 revision summary 를 노출하고, `/history` 와 `/diff` route 에서 기본 history/diff UI 를 렌더한다.
4. 앱이 자주 읽는 metadata 는 `WikiPageShadowRecord`, `WikiRevisionShadowRecord`, `WikiShadowStore` 형태로 shadowing 한다.
5. `apps/workers` 는 `syncRecentChangesToShadowStore` skeleton 으로 recent changes 를 shadow metadata 로 옮긴다.
6. `MediaWikiEngine` 은 공식 MediaWiki API 를 사용해야 하는 placeholder skeleton 으로만 추가하고, 실제 연동은 이후 phase 로 미룬다.

## Consequences

### Positive

- public page 가 approved revision 만 보여야 한다는 제품 원칙을 코드와 테스트로 고정할 수 있다.
- history/diff UI 와 shadow metadata 가 먼저 생겨서 이후 review flow 와 real MediaWiki integration 의 접점이 명확해진다.
- recent changes poller 와 app shadow table 경계를 direct DB access 없이 유지할 수 있다.

### Negative

- 현재 shadow store 는 in-memory skeleton 이라 persistence 가 없다.
- history/diff 는 custom shell 이고, 실제 MediaWiki diff 렌더링과 1:1 일치하지 않는다.
- MediaWikiEngine 은 아직 contract placeholder 이므로 real integration 은 이후 phase 에서 추가 작업이 필요하다.

## Rejected Alternatives

### 1. MediaWiki native history/diff 를 Phase 2 에 바로 embed

기각 이유:
- fake-first 진행성을 해친다.
- real integration blocker 가 생기면 history/diff UI 작업이 멈춘다.

### 2. shadow metadata 없이 MediaWiki render 만 사용

기각 이유:
- 앱이 자주 읽는 revision metadata 를 안정적으로 조합하기 어렵다.
- public read model 과 review workflow 가 MediaWiki 내부 구조에 과하게 결합된다.
