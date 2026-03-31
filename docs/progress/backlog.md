# Backlog

## Phase 2 Backlog

1. WikiEngine read contract 를 history / diff / approved / latest revision 기준으로 Phase 2 범위에 맞게 확정
2. FakeWikiEngine contract tests 를 approved / pending / reverted / recent changes 분기까지 확장
3. web app 에 stock wiki revision metadata, history, diff read model 을 추가
4. MediaWikiEngine skeleton 과 app shadow table 경계를 direct DB access 없이 스캐폴딩
5. recent changes sync worker skeleton 을 `apps/workers` 에 추가

## Deferred From Phase 1

1. discussion preview read model 을 실제 토론 도메인 shape 에 더 가깝게 정리

## Deferred From Phase 0

1. local infra 실제 기동 smoke (`docker compose up`) 와 healthcheck 추가
2. MediaWiki extension profiles 세분화
3. CI workflow skeleton
4. markdown lint and doc validation hooks
