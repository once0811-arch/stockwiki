# Backlog

상세 debt ledger: `docs/progress/debt-ledger.md`

## Phase 4 Backlog

1. citation helper UI 와 source tier scaffolding 추가
2. source presence checks 와 outdated source warnings 추가
3. report reason `no citation` 과 moderation rule hook 추가
4. contentious edit queue 와 citation-required section rule 을 연결

## Deferred From Phase 3

1. fake session harness 와 web route shell 을 앱 auth/API 경계에 맞게 치환
2. in-memory review queue 와 reputation event store 를 persistent app DB adapter 로 교체
3. demo login shell 을 real auth/session flow 로 치환

## Deferred From Phase 2

1. public read API endpoints (`/api/public/stocks/:market/:ticker/history`, `/diff`) 를 별도 slice 로 정리
2. in-memory shadow store 를 persistent app DB adapter 로 교체
3. MediaWikiEngine contract tests 와 real API fixture harness 추가

## Deferred From Phase 1

1. discussion preview read model 을 실제 토론 도메인 shape 에 더 가깝게 정리

## Deferred From Phase 0

1. local infra 실제 기동 smoke (`docker compose up`) 와 healthcheck 추가
2. MediaWiki extension profiles 세분화
