# Backlog

상세 debt ledger: `docs/progress/debt-ledger.md`

## Phase 8 Backlog

1. docker-backed `MediaWikiEngine` read/render/history/diff adapter 를 official API boundary 로 연결
2. canonical page key 와 MediaWiki title mapping 을 명시하고 fake engine 계약과 drift 가 없는지 contract test 로 고정
3. edit integration 과 recent changes poller 를 real MediaWiki runtime 에 연결하되 approved render stability 를 유지
4. OIDC/SSO wiring shell 과 extension wiring 범위를 fake-first app phase 와 충돌하지 않게 잘라낸다

## Deferred From Phase 7

1. in-memory watchlist / notification store 를 persistent app DB adapter 와 outbox 로 치환
2. notification read state, preference 저장, richer subscription granularity 를 real UX/API slice 로 확장
3. digest email stub 를 real sender, retry policy, delivery audit trail 과 연결

## Deferred From Phase 6

1. fake-first search read model 과 lag snapshot 을 real OpenSearch adapter / persistent index 로 치환
2. typo correction, filter facets, recent searches 를 richer search UX slice 로 확장
3. public search result set 을 theme / industry / people / event pages 까지 확장

## Deferred From Phase 5

1. in-memory discussion thread/comment/report store 를 persistent app DB adapter 로 교체
2. discussion report handling, pin/lock actions, audit trail 을 dedicated admin/mod queue boundary 로 분리
3. fake session based discussion participation 을 real auth/session boundary 로 치환

## Deferred From Phase 4

1. fixed-slot citation helper 를 dynamic ref composer / richer editor shell 로 확장
2. source policy findings, report reasons, dead-link scan 결과를 persistent app DB adapter 로 치환
3. real MediaWiki ref parsing / source normalization / retryable dead-link workflow 연결

## Deferred From Phase 3

1. fake session harness 와 web route shell 을 앱 auth/API 경계에 맞게 치환
2. in-memory review queue 와 reputation event store 를 persistent app DB adapter 로 교체
3. demo login shell 을 real auth/session flow 로 치환

## Deferred From Phase 2

1. public read API endpoints (`/api/public/stocks/:market/:ticker/history`, `/diff`) 를 별도 slice 로 정리
2. in-memory shadow store 를 persistent app DB adapter 로 교체
3. MediaWikiEngine contract tests 와 real API fixture harness 추가

## Deferred From Phase 0

1. MediaWiki extension profiles 세분화
