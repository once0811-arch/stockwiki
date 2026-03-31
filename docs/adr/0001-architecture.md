# ADR 0001: Phase 0 Monorepo And Fake-First Harness

- Status: Accepted
- Date: 2026-03-31
- Decision Makers: User, Codex

## Context

StockWiki는 향후 여러 phase 에 걸쳐 구현될 제품이고, 초반에는 외부 연동보다 에이전트가 안정적으로 반복 작업할 수 있는 저장소 구조가 더 중요하다.
루트 PRD와 `AGENTS.md` 는 다음을 강하게 요구한다.

- `pnpm workspaces` + `Turborepo`
- `apps/web` 는 Next.js App Router
- `apps/api` 는 NestJS
- `services/wiki-bridge` 와 `packages/fixtures` 를 통한 fake-first adapter 구조
- 문서와 progress 를 저장소 파일에 유지

## Decision

Phase 0 에서는 다음 구조를 채택한다.

1. 루트는 `pnpm` workspace 와 `turbo` task graph 로 통합한다.
2. 도메인 계약은 `packages/domain` 에 둔다.
3. `FakeWikiEngine` 는 `services/wiki-bridge` 에 둔다.
4. `FixtureMarketDataProvider` 와 샘플 fixture 는 `packages/fixtures` 에 둔다.
5. 테스트 재사용 헬퍼는 `packages/testkit` 에 둔다.
6. `apps/web` 와 `apps/api` 는 실제 제품 기능 대신 health/smoke surface 만 제공한다.
7. 로컬 인프라는 `infra/compose/docker-compose.yml` 로 초안을 제공하되, 환경에 `docker` 가 없으면 blocker 로 기록한다.

## Consequences

### Positive

- later phase 에서 실제 MediaWiki 와 외부 공급자를 붙여도 계약 경계가 유지된다.
- fake-first 흐름으로 Phase 1 이전에도 lint/typecheck/test 를 안정적으로 돌릴 수 있다.
- 문서, 코드, 테스트, 명령이 같은 저장소 안에서 함께 진화한다.

### Negative

- Phase 0 산출물은 제품 기능보다 scaffolding 비중이 높다.
- health surface 중심이라 사용자 가치가 직접 드러나지 않는다.
- `docker compose config` 는 로컬 머신 의존성이 있어 현재 환경에서는 검증이 막힐 수 있다.

## Rejected Alternatives

### 1. 단일 앱 저장소

기각 이유:
- PRD 와 고정 아키텍처에 맞지 않는다.
- fake adapters 와 infra, docs, testkit 분리가 약해진다.

### 2. MediaWiki 실제 연동부터 시작

기각 이유:
- fake-first 원칙 위반
- Phase 0 범위를 넘어선다.

### 3. Docker 없이 로컬 infra 를 생략

기각 이유:
- PRD 가 compose 초안을 명시적으로 요구한다.
- later phase 실행성을 떨어뜨린다.
