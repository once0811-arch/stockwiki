# Backlog

상세 debt ledger: `docs/progress/debt-ledger.md`

## Phase 7 Backlog

1. watchlist add/remove shell 과 fake session gating 을 추가
2. notification center shell 을 만들고 watchlist / approved revision / discussion reply event 를 묶는다
3. digest email stub 와 notification preference surface 를 추가
4. approved revision notify 와 discussion reply notify worker skeleton 을 추가

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
