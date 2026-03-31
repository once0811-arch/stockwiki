# AGENTS.md — StockWiki agent operating manual

이 파일은 StockWiki 저장소에서 일하는 코딩 에이전트를 위한 공용 운영 규약이다.
Claude Code에서는 `CLAUDE.md`가 이 파일을 import해서 읽는 것을 전제로 한다.

## 0. Mission

StockWiki는 **주식/기업/산업/테마 정보를 구조화된 문서로 축적하고, 토론과 검수를 통해 신뢰도를 높이는 참여형 지식 플랫폼**이다.

이 저장소의 핵심 목표는 아래 둘을 동시에 만족하는 것이다.

1. 실제 운영 가능한 제품을 만든다.
2. 에이전트가 처음부터 끝까지 자율적으로 구현하기 쉬운 하네스 중심 저장소를 만든다.

## 1. Source of truth

우선순위는 아래 순서를 따른다.

1. `docs/prd/stockwiki-prd.md`
2. `docs/adr/*.md`
3. 이 `AGENTS.md`
4. 저장소 안의 README, runbook, eval 문서
5. 코드에서 발견한 지역 관례

규칙:
- PRD와 구현이 충돌하면 조용히 구조를 바꾸지 말고 ADR을 남긴다.
- PRD에 없는 대규모 범위 확장은 금지한다.
- 자동 메모리나 세션 기억에 의존하지 말고, **중요 상태는 항상 저장소 파일에 기록**한다.

## 2. Fixed product truths

이 프로젝트에서 바꾸면 안 되는 제품 원칙:
- 공개 읽기 중심이다.
- 본문 위키와 의견 토론은 분리한다.
- 시스템 구조화 데이터는 사용자 자유 편집 대상이 아니다.
- 공개 페이지는 기본적으로 **approved revision** 을 보여준다.
- 이 서비스는 투자 자문, 종목 추천, 매매 유도 서비스를 만들지 않는다.
- 사실 서술과 의견 서술을 섞지 않는다.

## 3. Fixed architecture decisions

고정 기술 방향:
- 모노레포: `pnpm workspaces` + `Turborepo`
- `apps/web`: `Next.js` App Router
- `apps/api`: `NestJS`
- `apps/workers`: background workers / Temporal workers
- `services/wiki-bridge`: WikiEngine adapter layer
- `packages/domain`: shared domain types and contracts
- `packages/ui`: reusable UI
- `packages/config`: lint, tsconfig, shared tooling presets
- `packages/fixtures`: fake data providers and fixtures
- `packages/testkit`: test helpers and contract test harness
- 앱 도메인 DB: PostgreSQL
- 캐시 및 rate limit: Redis
- 검색: OpenSearch
- 워크플로우: Temporal
- 위키 코어: MediaWiki
- 로컬 인프라: Docker Compose
- 운영 관측성: OpenTelemetry + Prometheus/Grafana + Sentry

## 4. Hard boundaries

아래는 절대 어기지 않는다.

1. **MediaWiki DB direct access 금지**
   - MediaWiki 내부 테이블을 직접 join/read/write 하지 않는다.
   - 공식 API 또는 브리지 계층만 사용한다.

2. **Fake-first 구현 원칙**
   - `WikiEngine`, `MarketDataProvider`, `NewsProvider`, `SearchIndexer`, `NotificationSender` 는 fake/fixture 구현을 먼저 만든다.
   - 외부 API가 없어도 흐름이 작동해야 한다.

3. **One phase at a time**
   - 항상 하나의 phase만 진행한다.
   - 한 세션에서 여러 phase를 동시에 건드리지 않는다.

4. **One vertical slice at a time**
   - 큰 범위를 한 번에 만들지 않는다.
   - 한 슬라이스는 코드 + 테스트 + 문서 + 실행 명령까지 끝나야 한다.

5. **Public read model은 앱이 조합한다**
   - MediaWiki 화면을 그대로 전면 노출하지 않는다.
   - 공개 페이지는 system data + approved wiki content + revision metadata + discussion summary 를 앱이 조합한다.

6. **Outbox + workflow 우선**
   - V1에서는 Kafka 등 대형 메시지 버스를 도입하지 않는다.
   - Postgres outbox + Temporal 조합을 우선한다.

## 5. First-class repository artifacts

초기 세션에서 반드시 갖춰야 하는 파일/디렉터리:

```text
CLAUDE.md
AGENTS.md
docs/prd/stockwiki-prd.md
docs/adr/0001-architecture.md
docs/runbooks/local-dev.md
docs/runbooks/moderation.md
docs/evals/core-flows.md
docs/progress/current-phase.md
docs/progress/backlog.md
apps/web/
apps/api/
apps/workers/
services/wiki-bridge/
packages/domain/
packages/ui/
packages/config/
packages/fixtures/
packages/testkit/
.claude/settings.json
.claude/commands/
scripts/hooks/
infra/compose/
```

## 6. Required working style

항상 이 순서를 따른다.

1. 현재 phase 확인
2. PRD의 관련 섹션 읽기
3. ADR 확인
4. `docs/progress/current-phase.md` 읽기
5. 최소 수직 슬라이스 계획 수립
6. 코드 작성
7. 가장 작은 충분한 범위의 lint/typecheck/test 실행
8. 문서와 progress 갱신
9. 다음 슬라이스 제안

추가 규칙:
- 루틴 수준의 애매함은 질문으로 멈추지 말고 가장 단순한 선택을 한다.
- 선택이 구조에 영향을 주면 ADR로 남긴다.
- 바뀐 package 범위에 맞는 검증을 먼저 돌리고, 전역 검증은 slice 종료 시 수행한다.
- 테스트 없는 대규모 리팩터는 금지한다.

## 7. Verification gates

어떤 작업도 아래를 만족하기 전에는 완료가 아니다.

- 관련 코드가 존재한다.
- 관련 테스트가 존재한다.
- 관련 문서가 갱신됐다.
- 실행 명령이 기록됐다.
- 실패/리스크/우회가 명시됐다.
- 임시 TODO/FIXME를 남겼다면 backlog 문서에 추적 항목이 있다.

최소 표준 명령:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- 필요 시 `pnpm --filter <pkg> build`
- 필요 시 `docker compose config`

## 8. Forbidden moves

아래 행동은 금지한다.

- 여러 phase 동시 진행
- 실제 외부 데이터 공급자부터 연결 시작
- MediaWiki 직접 DB 접근
- 파괴적 shell 명령 실행
- 근거 없는 기술 스택 교체
- 테스트/문서 없는 대규모 코드 생성
- 비밀값, 토큰, `.env` 실제값을 저장소에 커밋
- 구현 범위를 몰래 키우는 것
- 완료 기준을 충족하기 전에 완료 선언하는 것

## 9. Ralph Loop contract

Ralph Loop를 전제로 항상 아래를 지킨다.

### 9.1 Completion token convention
- 토큰 형식: `STOCKWIKI_<PHASE>_COMPLETE`
- 첫 세션 토큰: `STOCKWIKI_PHASE0_COMPLETE`
- **이 토큰은 실제 완료 시점 최종 응답에서만 출력한다.**
- 코드, 주석, 문서 예시, 중간 보고에서 completion token을 그대로 재사용하지 않는다.

### 9.2 Persistent progress discipline
- 세션 기억에 의존하지 말고 아래 파일을 매 반복에서 최신화한다.
  - `docs/progress/current-phase.md`
  - `docs/progress/backlog.md`
- `current-phase.md` 에는 반드시 아래를 유지한다.
  - current phase
  - completed
  - in progress
  - blockers
  - next slice
  - verification snapshot

### 9.3 Loop-safe behavior
- 한 번 막혔다고 종료하지 않는다.
- 외부 연동이 막히면 fake adapter + contract tests + ADR로 우회한다.
- 같은 오류에 두 번 이상 반복되면 범위를 줄이고 원인을 문서화한 뒤 다시 진행한다.
- 큰 파일 하나를 한 번에 길게 만드는 것보다, 작게 나누고 검증을 자주 한다.
- 답변 형식은 매 반복에서 아래 5개 섹션을 유지한다.
  1. `STATUS`
  2. `CHANGED`
  3. `VERIFIED`
  4. `NEXT`
  5. `BLOCKERS`

## 10. Suggested subagent map

프로젝트가 안정화되면 `.claude/agents/` 에 아래 subagent를 둘 수 있다.

- `prd-keeper`
  - 목적: PRD/ADR 정합성 검사
  - 도구: read-only 중심
- `repo-bootstrapper`
  - 목적: phase 0 저장소 부트스트랩
- `web-builder`
  - 목적: Next.js 페이지와 UI 구현
- `api-builder`
  - 목적: NestJS API, domain wiring
- `wiki-bridge`
  - 목적: WikiEngine contract, FakeWikiEngine, MediaWikiEngine
- `qa-guardian`
  - 목적: unit/integration/e2e/eval 정리
- `ops-guard`
  - 목적: compose, hooks, CI, observability
- `docs-adr`
  - 목적: ADR, runbook, progress 문서 정리

원칙:
- subagent는 설명을 명확히 쓰고, 최소 도구만 준다.
- 탐색/조사와 실제 구현 컨텍스트를 분리한다.
- phase 0에서 저장소 기본 뼈대가 생긴 뒤에만 프로젝트 subagent 파일을 만든다.

## 11. Phase discipline

### Phase 0
하네스와 저장소 부트스트랩만 한다.
- 모노레포 생성
- 기본 앱/패키지 skeleton
- docs/adr/runbooks/evals/progress 생성
- CLAUDE.md, hooks, commands, settings 구성
- fake adapters / contracts / fixtures 뼈대 생성
- lint/typecheck/test/dev 명령 정리
- docker compose 초안 생성
- 제품 기능 구현 금지

### Phase 1+
각 phase는 PRD에 정의된 범위만 구현한다.
- 다음 phase로 넘어가기 전 현재 phase의 DoD를 충족한다.
- phase 전환 시 `docs/progress/current-phase.md` 를 갱신한다.

## 12. Phase 0 explicit DoD

Phase 0은 아래가 모두 끝나야 완료다.

- `pnpm` workspace와 `turbo`가 작동한다.
- `apps/web`, `apps/api`, `apps/workers`, `packages/*`, `services/wiki-bridge` 기본 구조가 있다.
- `CLAUDE.md` 가 존재하고 `AGENTS.md` 를 import 한다.
- PRD/ADR/runbook/evals/progress 문서가 존재한다.
- root 수준 `lint`, `typecheck`, `test`, `check`, `dev` 스크립트가 정의된다.
- 최소 1개 unit test와 1개 smoke/e2e placeholder가 통과한다.
- `WikiEngine` / `FakeWikiEngine` / `MarketDataProvider` / `FixtureMarketDataProvider` 인터페이스 뼈대가 존재한다.
- `docker compose config` 가 통과한다.
- local setup 방법이 `docs/runbooks/local-dev.md` 에 정리되어 있다.
- Phase 1 backlog가 `docs/progress/backlog.md` 에 정리되어 있다.

## 13. Documentation rules

- 큰 선택은 항상 ADR로 남긴다.
- runbook은 실제 실행한 명령만 적는다.
- progress 문서는 현재 상태를 숨기지 않는다.
- 구현이 PRD와 달라지면 PRD를 먼저 바꾸지 말고 ADR에서 이유를 설명한다.
- README보다 `docs/prd`, `docs/adr`, `docs/runbooks`, `docs/evals`, `docs/progress` 를 우선 갱신한다.

## 14. Security and policy constraints

- 금융 표현은 정보성/설명성 중심으로 유지한다.
- 투자 권유, 가격 예측 확정 표현, 선동형 문구를 제품 사양에 포함하지 않는다.
- 개인정보, 비밀값, 운영 토큰을 fixture에 넣지 않는다.
- 차단/신고/검수 규칙은 초기부터 구조를 잡는다.

## 15. Default agent posture

이 저장소에서 에이전트는 아래 성향을 유지한다.
- 작은 단위로 진행
- 근거를 문서화
- 실패를 숨기지 않음
- 테스트 우선 또는 최소 동시 작성
- 명확한 인터페이스부터 정의
- 실제 통합보다 fake 흐름을 먼저 완성
- 장문 설명보다 실행 가능한 결과 우선

## 16. Start-of-session checklist

세션이 시작되면 아래를 먼저 수행한다.

1. `git status` 확인
2. `AGENTS.md`, `CLAUDE.md`, `docs/prd/stockwiki-prd.md` 읽기
3. `docs/progress/current-phase.md` 확인
4. 관련 ADR 확인
5. 오늘의 수직 슬라이스 한 개 선택
6. 완료 기준과 검증 명령을 먼저 적기

이 체크리스트를 건너뛰지 않는다.
