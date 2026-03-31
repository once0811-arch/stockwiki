# ADR 0004: Phase 3 Review Queue And Reputation Shell

- Status: Accepted
- Date: 2026-04-01
- Decision Makers: User, Codex

## Context

Phase 3 를 닫으려면 PRD 의 다음 조건을 만족해야 한다.

- contributor edit -> pending -> approve full flow E2E
- public revision gating 확인
- reputation event 발생
- mod queue basic
- reviewer approve/reject

실제 DB, real auth, NestJS authenticated API 를 모두 기다리면 reviewer workflow 구현이 Phase 3 안에서 멈춘다.

## Decision

Phase 3 완료를 위해 다음 fake-first shell 을 채택한다.

1. in-memory singleton edit proposal store 가 pending/approved/rejected 상태를 가진 reviewable proposal records 를 유지한다.
2. public/history/diff read model 은 store 상태를 읽어 `FakeWikiEngine.seedRevision(...)` 으로 approved/pending/rejected revisions 를 재구성한다.
3. reviewer workflow 는 `/review/mod-queue` route 와 `POST /api/wiki/review/[revisionId]/approve|reject` route handlers 로 제공한다.
4. review decision 은 `reputation_events` 를 닮은 in-memory event log 를 남긴다.
5. public render 는 approved revision 만 노출하고, rejected revision 은 history 에만 남긴다.

## Consequences

### Positive

- Phase 3 exit criteria 를 real auth, DB, background workflow 없이도 end-to-end 로 검증할 수 있다.
- public read gating, queue, approval, rejection, reputation event 가 한 read model 안에서 연결된다.
- Phase 4 이후 source policy 와 moderation rule hook 을 붙일 위치가 명확해진다.

### Negative

- review queue 와 reputation event 는 프로세스 메모리에만 존재한다.
- `FakeWikiEngine.seedRevision(...)` 은 app-layer fake workflow 를 위한 helper 이며 real MediaWiki integration 에 직접 대응하지 않는다.
- review API shell 은 최종적으로 `apps/api` 경계로 이동하거나 proxy 되어야 한다.

## Rejected Alternatives

### 1. reviewer approval 을 새 approved copy revision 으로만 표현

기각 이유:
- history/status 모델이 불필요하게 복잡해진다.
- Phase 3 에 필요한 approve/reject 판정을 단순하게 검증하기 어렵다.

### 2. reviewer queue 없이 approval route 만 제공

기각 이유:
- PRD 의 mod queue basic 요구를 만족하지 못한다.
- reviewer 가 pending diff 와 문맥을 보는 기본 운영 흐름이 사라진다.
