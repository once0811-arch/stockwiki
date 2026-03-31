---
title: StockWiki PRD
version: 1.0
status: Phase 0 bootstrap baseline
owner: OpenAI / User
language: ko-KR
last_updated: 2026-03-31
source_snapshot: stockwiki_prd_harness_v1.md
---

# StockWiki PRD

이 문서는 StockWiki 저장소의 canonical PRD다.
2026-03-31 기준 루트의 `stockwiki_prd_harness_v1.md` 를 Phase 0 실행에 필요한 내용으로 정리해 옮겼다.

## 1. Mission

StockWiki는 주식, 기업, 산업, 테마 정보를 구조화된 문서로 축적하고 토론과 검수를 통해 신뢰도를 높이는 참여형 지식 플랫폼이다.

제품 목표는 두 가지다.

1. 실제 운영 가능한 제품을 만든다.
2. 에이전트가 phase 단위로 자율 구현하기 쉬운 하네스 중심 저장소를 만든다.

## 2. Fixed Product Truths

- 공개 읽기 중심이다.
- 본문 위키와 의견 토론은 분리한다.
- 구조화 데이터는 사용자 자유 편집 대상이 아니다.
- 공개 페이지는 기본적으로 approved revision 을 보여준다.
- 투자 자문, 종목 추천, 매매 유도 서비스를 만들지 않는다.
- 사실 서술과 의견 서술을 섞지 않는다.

## 3. Fixed Architecture

- 모노레포: `pnpm workspaces` + `Turborepo`
- `apps/web`: `Next.js` App Router
- `apps/api`: `NestJS`
- `apps/workers`: background workers / Temporal workers
- `services/wiki-bridge`: WikiEngine adapter layer
- `packages/domain`: shared domain contracts
- `packages/ui`: reusable UI
- `packages/config`: shared tooling presets
- `packages/fixtures`: fake data providers and fixtures
- `packages/testkit`: contract and smoke test helpers
- 앱 도메인 DB: PostgreSQL
- 캐시 및 rate limit: Redis
- 검색: OpenSearch
- 워크플로우: Temporal
- 위키 코어: MediaWiki
- 로컬 인프라: Docker Compose
- 관측성: OpenTelemetry + Prometheus/Grafana + Sentry

## 4. Non-Negotiable Rules

1. MediaWiki DB direct access 금지
2. Fake-first 구현 원칙
3. One phase at a time
4. One vertical slice at a time
5. Public read model 은 앱이 조합한다
6. V1 메시징은 Postgres outbox + Temporal 우선

## 5. Service Boundaries

### Web App
- 공개 페이지, 검색, 토론, 계정, 관리자 UI
- SSR/SEO 우선

### App API
- 사용자, 권한, 토론, 신고, 알림, watchlist, 검색 조합 API
- wiki bridge 와 provider adapters 를 호출한다

### Wiki Engine
- MediaWiki 기반 문서 저장, revision, diff, rollback, review

### Service Data
- PostgreSQL 기반 앱 도메인 전용 저장소

### Search / Workflow / Cache
- OpenSearch
- Temporal
- Redis

## 6. Domain Contracts Required From Day One

```ts
interface WikiEngine {
  getPage(key: PageKey): Promise<PageContent | null>;
  getRenderedHtml(key: PageKey, revisionId?: RevisionId): Promise<RenderedPage>;
  getHistory(key: PageKey): Promise<PageRevision[]>;
  compareRevisions(key: PageKey, from: RevisionId, to: RevisionId): Promise<DiffResult>;
  createOrUpdatePage(input: EditPageInput): Promise<EditResult>;
  rollback(input: RollbackInput): Promise<RollbackResult>;
  protectPage(input: ProtectPageInput): Promise<void>;
  getRecentChanges(cursor?: string): Promise<RecentChangeBatch>;
}

interface MarketDataProvider {
  getQuote(key: StockKey): Promise<Quote>;
  getCompanyProfile(key: StockKey): Promise<CompanyProfile>;
  getRecentFilings(key: StockKey): Promise<Filing[]>;
  getCorporateActions(key: StockKey): Promise<CorporateAction[]>;
}
```

Phase 0 구현체:

- `FakeWikiEngine`
- `FixtureMarketDataProvider`

## 7. Repository Layout

```text
apps/
  web/
  api/
  workers/
services/
  wiki-bridge/
packages/
  domain/
  ui/
  config/
  fixtures/
  testkit/
infra/
  compose/
docs/
  prd/
  adr/
  runbooks/
  evals/
  progress/
.claude/
  settings.json
  commands/
scripts/
  hooks/
```

## 8. Phase Plan

### Phase 0

범위:

- monorepo skeleton
- workspace/tooling 설정
- `CLAUDE.md` / docs / ADR / runbooks / evals / progress 생성
- fake adapter 와 contract test scaffold
- root `lint`, `typecheck`, `test`, `check`, `dev`, `build` scripts
- Docker Compose 초안
- 최소 health/smoke surface

종료 조건:

- `pnpm lint` 통과
- `pnpm typecheck` 통과
- `pnpm test` 통과
- `docker compose config` 통과
- 최소 1개 unit test 와 1개 smoke/e2e placeholder test 통과
- Phase 1 backlog 문서화

### Phase 1

읽기 전용 stock page MVP:

- fixture stock master
- market snapshot fixture
- public stock page route
- system data card
- wiki panel based on `FakeWikiEngine`
- discussion preview placeholder
- SEO metadata

### Later Phases

- Phase 2: wiki bridge abstraction and revision model
- Phase 3: edit suggestion flow
- Phase 4: discussion system
- Phase 5: search
- Phase 6: moderation and reputation
- Phase 7: workflows and indexing
- Phase 8: real MediaWiki integration

## 9. Verification Discipline

- 변경 시 관련 package 범위의 lint/typecheck/test 를 우선 실행한다.
- 문서, ADR, progress 는 코드와 함께 갱신한다.
- 큰 구조 변경은 ADR 없이 하지 않는다.
- 외부 연동이 막히면 fake adapter 와 contract tests 로 우회한다.
