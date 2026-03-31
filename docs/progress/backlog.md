# Backlog

## Phase 3 Backlog

1. contributor edit intent UI 와 edit summary 입력 플로우 추가
2. pending revision 저장 API 또는 동등한 app flow 추가
3. reviewer approve/reject action skeleton 과 mod queue basic 추가
4. public page approved revision gating 을 edit/approve full flow 로 검증
5. reputation event skeleton 추가

## Deferred From Phase 2

1. public read API endpoints (`/api/public/stocks/:market/:ticker/history`, `/diff`) 를 별도 slice 로 정리
2. in-memory shadow store 를 persistent app DB adapter 로 교체
3. MediaWikiEngine contract tests 와 real API fixture harness 추가

## Deferred From Phase 1

1. discussion preview read model 을 실제 토론 도메인 shape 에 더 가깝게 정리

## Deferred From Phase 0

1. local infra 실제 기동 smoke (`docker compose up`) 와 healthcheck 추가
2. MediaWiki extension profiles 세분화
3. CI workflow skeleton
4. markdown lint and doc validation hooks
