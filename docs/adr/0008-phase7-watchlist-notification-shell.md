# ADR 0008: Phase 7 Watchlist And Notification Shell

- Status: Accepted
- Date: 2026-04-01
- Decision Makers: User, Codex

## Context

Phase 7 의 목표는 사용자가 관심 종목 페이지를 구독하고,
approved revision 변경과 discussion reply 를 계속 추적하게 만드는 것이다.
PRD 는 다음을 요구한다.

- stock page watchlist add/remove
- `/me/watchlist`
- in-app notification center
- digest email stub
- approved revision notify
- discussion reply notify

Phase 6 까지 저장소에는 search shell 과 discussion shell 은 있었지만,
watchlist state 나 notification center 경계는 아직 없었다.
real auth, persistent app DB, email sender, outbox workflow 를 한 번에 붙이면
fake-first Phase 7 범위를 넘어서게 된다.

## Decision

Phase 7 에서는 다음 fake-first shell 을 채택한다.

1. watchlist 와 notification shared contract 는 `@stockwiki/domain` 에 둔다.
   - web read model 과 worker digest skeleton 이 같은 notification shape 를 읽는다.
2. watchlist/notification state 는 `apps/web/src/watchlist` app-layer feature 로 둔다.
   - store 는 process memory 를 사용하고 stock page, review workflow, discussion action 이 fan-out hook 으로 연결된다.
3. stock page 는 fake session actor 가 있을 때만 watchlist add/remove 를 노출한다.
   - anonymous 사용자는 demo login shell 로 이어지고, member 이상 역할은 `/me/watchlist` notification center 로 이동할 수 있다.
4. approved revision notify 는 reviewer approve 시점에,
   discussion reply notify 는 comment submit 시점에 watchlist watcher fan-out 으로 생성한다.
5. digest email 은 real sender 대신 worker digest preview 로 먼저 닫는다.

## Consequences

### Positive

- stock page, review flow, discussion flow 가 Phase 7 에서 하나의 notification center 로 연결된다.
- worker digest shell 과 web digest preview 가 같은 shared notification contract 를 사용한다.
- Phase 8 MediaWiki 통합 이후에도 watchlist/notification 은 app-layer concern 으로 남아 서비스 경계가 유지된다.

### Negative

- watchlist, notification, digest state 는 아직 process memory 와 fake session 에만 존재한다.
- read/unread 상태 변경, notification preference 저장, real email sender 는 아직 없다.
- page watcher fan-out 은 stock page 단위로만 동작하고 richer subscription granularity 는 없다.

## Rejected Alternatives

### 1. watchlist 와 notification 을 wiki engine contract 안으로 넣기

기각 이유:
- 위키 엔진 책임이 문서 저장/리비전 모델을 넘어 과도하게 커진다.
- app DB concern 과 worker/outbox concern 이 MediaWiki integration phase 와 섞인다.

### 2. Phase 7 에 real mailer 와 persistent outbox 를 바로 도입하기

기각 이유:
- fake-first phase 진행성을 해친다.
- auth, preferences, delivery retry policy 가 아직 고정되지 않았다.
