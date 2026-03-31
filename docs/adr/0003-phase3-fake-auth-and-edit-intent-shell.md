# ADR 0003: Phase 3 Fake Auth And Edit Intent Shell

- Status: Accepted
- Date: 2026-03-31
- Decision Makers: User, Codex

## Context

Phase 3 의 첫 수직 슬라이스는 edit intent flow, contributor role gating, save pending revision 을 fake-first 방식으로 연결해야 한다.
PRD 는 다음을 명시한다.

- 읽기 화면의 편집 버튼은 로그인 상태와 권한 레벨에 따라 분기되어야 한다
- 일반 contributor 편집은 기본적으로 pending revision 으로 저장된다
- public default revision 은 마지막 approved revision 을 유지해야 한다
- reviewer approve/reject 와 mod queue 는 이후 같은 phase 에서 이어져야 한다

실제 로그인, 세션 저장, 앱 DB, NestJS authenticated API 를 한 번에 붙이면 첫 슬라이스 범위를 넘어선다.

## Decision

Phase 3 첫 슬라이스에서는 다음 구조를 채택한다.

1. `apps/web` 는 `actor` query parameter 기반 fake session harness 로 로그인 상태와 역할을 흉내 낸다.
2. `/stocks/[market]/[ticker]/edit` route 는 anonymous/member/contributor/reviewer 분기를 직접 보여준다.
3. `POST /api/wiki/edit-intents` 는 Next.js route handler shell 로 구현해 edit summary 와 proposed content 를 받아 pending edit draft 를 저장한다.
4. pending edit draft 는 in-memory singleton store 에 저장하고, `getStockWikiSnapshot` 이 seed revisions 뒤에 draft 를 주입해 public/history/diff read model 이 같은 fake state 를 읽게 한다.
5. public read route 는 여전히 approved revision 만 렌더하고, 새 pending edit 는 history 와 revision summary 에만 반영한다.

## Consequences

### Positive

- Phase 3 edit entry 와 pending save path 를 real auth 나 persistent backend 없이 바로 검증할 수 있다.
- public read gating 과 pending review state 를 같은 fake-first read model 에서 계속 검증할 수 있다.
- reviewer queue 와 approve/reject skeleton 이 다음 slice 에서 붙을 자리가 분명해진다.

### Negative

- `actor` query parameter 는 실제 인증이 아니며 보안 경계가 아니다.
- in-memory pending edit store 는 프로세스 재시작 시 사라진다.
- `POST /api/wiki/edit-intents` 는 최종적으로 `apps/api` 경계로 이동하거나 proxy 되어야 한다.

## Rejected Alternatives

### 1. Phase 3 첫 슬라이스에서 real login 과 persistent DB 를 같이 도입

기각 이유:
- 첫 수직 슬라이스 범위를 넘긴다.
- reviewer queue 와 reputation event 전에 auth/storage 결합도가 너무 높아진다.

### 2. pending edit 를 read model 에 반영하지 않고 confirmation 화면만 구현

기각 이유:
- PRD 의 `pending revision 생성 확인`, `public page는 approved 유지` 조건을 검증할 수 없다.
- reviewer queue 와 history route 의 연결점이 약해진다.
