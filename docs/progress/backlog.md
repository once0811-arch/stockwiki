# Backlog

상세 debt ledger: `docs/progress/debt-ledger.md`

## Phase 6 Backlog

1. exact ticker / canonical title / alias match 를 지원하는 fake-first search index contract 와 fixture set 추가
2. `/search` page 와 `GET /api/public/search?q=` shell 을 구현하고 reviewed-content-first ranking 을 고정
3. autocomplete 와 alias support 를 포함한 기본 result grouping 을 추가
4. approved review, alias update, discussion created 이벤트를 받는 indexing pipeline skeleton 과 lag metric surface 를 추가

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

1. local infra 실제 기동 smoke (`docker compose up`) 와 healthcheck 추가
2. MediaWiki extension profiles 세분화
