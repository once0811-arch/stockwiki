# Debt Ledger

Phase 0~3에서 남겼던 부채를 backlog보다 더 운영 친화적으로 추적하기 위한 문서다.
이 문서는 "지금 바로 해결 가능한가", "왜 아직 남았는가", "어느 phase에서 다루는가"를 같이 적는다.

## Resolved

| ID | Phase | Item | Closed On | Evidence |
| --- | --- | --- | --- | --- |
| D-001 | Phase 0 | GitHub Actions CI skeleton 추가 | 2026-04-01 | `.github/workflows/ci.yml` |
| D-002 | Phase 0 | markdown lint 와 docs validation command 추가 | 2026-04-01 | `.markdownlint-cli2.jsonc`, `scripts/validate-docs.ts` |
| D-003 | Phase 0 | placeholder hook 를 package-scoped lint/doc checks 와 secret guard 로 교체 | 2026-04-01 | `scripts/hooks/post-edit-check.sh`, `scripts/hooks/guard-secrets.sh` |
| D-004 | Harness | `.claude/settings.json` phase drift 수정 | 2026-04-01 | `.claude/settings.json` |
| D-015 | Harness | root-level validation scripts 를 lint/typecheck 표면에 포함 | 2026-04-01 | `package.json`, `tsconfig.scripts.json` |

## Remaining

| ID | Phase | Item | Status | Why It Remains | Best Next Slice |
| --- | --- | --- | --- | --- | --- |
| D-005 | Phase 0 | local infra `docker compose up` 실제 기동 smoke 와 healthcheck 확인 | Blocked by environment | 현재 세션은 Docker daemon 이 떠 있지 않아 실제 기동 검증을 완료할 수 없다 | daemon 이 준비된 세션에서 compose up/down smoke 와 health endpoint 확인 |
| D-006 | Phase 0 | MediaWiki extension profiles 세분화 | Deferred by roadmap | 실제 MediaWiki 통합 전에는 어떤 extension profile 이 필요한지 고정하기 이르다 | Phase 8 MediaWiki 통합 시작 시 profile matrix 정의 |
| D-007 | Phase 1 | discussion preview read model 을 실제 discussion domain shape 에 맞게 정교화 | Deferred by roadmap | 현재는 placeholder 로 충분하고 토론 도메인 자체가 아직 없다 | Phase 5 discussion slice 에서 shape 재정의 |
| D-008 | Phase 2 | public history/diff read API endpoints 분리 | Deferred by scope | UI slice 와 fake-first contract 는 있으나 public API 경계는 아직 별도 가치가 낮다 | history/diff API consumer 가 생길 때 API slice 로 분리 |
| D-009 | Phase 2 | in-memory shadow store 를 persistent app DB adapter 로 치환 | Deferred by architecture | app DB schema/migration/outbox 설계 없이 고정하면 재작업 가능성이 높다 | app DB schema 가 잡히는 시점에 persistence adapter 추가 |
| D-010 | Phase 2 | `MediaWikiEngine` contract tests 와 real API fixture harness 추가 | Deferred by dependency | real MediaWiki runtime 과 fixture harness 가 아직 없다 | Phase 8 이전에 docker-backed contract harness 추가 |
| D-011 | Phase 3 | fake session harness 를 real auth/API 경계로 치환 | Deferred by roadmap | auth/session 제품 요구와 앱/API 경계가 아직 고정되지 않았다 | auth 도입 slice 에서 replacement |
| D-012 | Phase 3 | in-memory review queue 와 reputation event store 를 persistent adapter 로 치환 | Deferred by architecture | moderation persistence 와 audit schema 가 아직 없다 | moderation/app DB slice 에서 replacement |
| D-013 | Phase 3 | demo login shell 을 real auth/session flow 로 치환 | Deferred by roadmap | fake-first E2E 목적은 달성했지만 실제 인증 제품은 아직 phase 밖이다 | auth 도입 slice 에서 replacement |
| D-014 | Harness | `schema` / `api` / `dto` 변경 시 OpenAPI 또는 타입 생성 검증 hook | Not yet implemented | 현재 저장소에 generation pipeline 이 없어서 hook 이 진짜 검증을 수행할 수 없다 | OpenAPI/typegen pipeline 도입과 함께 hook 연결 |

## Notes

- backlog 는 phase 계획용 문서다.
- 이 문서는 남은 부채를 실행 가능성 기준으로 정렬하는 운영 ledger 다.
- 해결 가능한 부채를 닫을 때는 backlog 와 이 문서를 같이 갱신한다.
