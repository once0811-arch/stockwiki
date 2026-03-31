# StockWiki 첫 실행 프롬프트 — Claude Code + Ralph Loop

이 프롬프트는 **첫 세션용**이다. 목적은 **Phase 0 부트스트랩만 완료**하는 것이다.

## completion promise

`STOCKWIKI_PHASE0_COMPLETE`

## 권장 사용 방식

- 먼저 저장소 루트에 아래 파일을 둔다.
  - `AGENTS.md`
  - `CLAUDE.md`
  - `docs/prd/stockwiki-prd.md`
- 그 다음 Claude Code에서 이 프롬프트를 넣고 Ralph Loop로 시작한다.
- 이 세션에서는 **기능 구현이 아니라 하네스와 저장소 기반 구축**만 한다.

## copy/paste prompt

```text
Read CLAUDE.md, AGENTS.md, and docs/prd/stockwiki-prd.md first.
Treat docs/prd/stockwiki-prd.md as the source of truth.
Operate in strict Phase 0 only.

Your job is to bootstrap the StockWiki repository so later Ralph Loop sessions can finish the product phase by phase without losing structure.

Scope for this session:
1. Create a pnpm workspace + turborepo monorepo foundation.
2. Scaffold apps/web (Next.js), apps/api (NestJS), apps/workers, services/wiki-bridge, and packages/domain, ui, config, fixtures, testkit.
3. Create or validate these documents:
   - docs/prd/stockwiki-prd.md
   - docs/adr/0001-architecture.md
   - docs/runbooks/local-dev.md
   - docs/runbooks/moderation.md
   - docs/evals/core-flows.md
   - docs/progress/current-phase.md
   - docs/progress/backlog.md
4. Create CLAUDE.md importing AGENTS.md if not already present.
5. Add root scripts for lint, typecheck, test, check, dev, and build.
6. Add baseline tooling and shared config so the repo is deterministic.
7. Add fake-first domain contracts only:
   - WikiEngine
   - FakeWikiEngine
   - MarketDataProvider
   - FixtureMarketDataProvider
8. Add minimal smoke surfaces only, not real product features:
   - web health/smoke route
   - api health endpoint
   - one unit test
   - one smoke/e2e placeholder test
9. Add Docker Compose scaffolding for local dependencies:
   - postgres
   - redis
   - opensearch
   - temporal
   - mediawiki
   - s3-compatible local storage if practical
   The config must at least pass docker compose config. If some service should be profile-gated or disabled by default, document that.
10. Add .claude/settings.json, scripts/hooks/, and .claude/commands/ placeholders aligned with the PRD harness approach.
11. Make local setup runnable from docs/runbooks/local-dev.md.
12. Update docs/progress/current-phase.md after each meaningful milestone.

Hard constraints:
- Phase 0 only. Do not build stock pages, auth, discussions, approvals, search UX, or real moderation flows yet.
- No real external API integration.
- No direct MediaWiki DB access.
- Prefer simple and reversible choices.
- If a structural choice is needed, document it in docs/adr/0001-architecture.md.
- If an integration is blocked, keep the interface and fake implementation so the repository remains buildable.
- Do not ask routine clarification questions. Choose the simplest compliant path and continue.
- Keep the working tree focused. Avoid speculative code for later phases.

Required completion criteria:
- The repository boots as a pnpm workspace.
- Root scripts exist for lint, typecheck, test, check, dev, and build.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- docker compose config passes.
- CLAUDE.md imports AGENTS.md.
- docs/adr, docs/runbooks, docs/evals, and docs/progress files exist and are meaningful.
- Fake contracts and fake providers exist.
- At least one unit test and one smoke/e2e placeholder test pass.
- docs/progress/backlog.md contains the Phase 1 backlog.
- Final response lists exact verification commands run, exact files added/changed, and remaining non-blocking risks.

Response format on every iteration:
STATUS
CHANGED
VERIFIED
NEXT
BLOCKERS

Do not output the exact string STOCKWIKI_PHASE0_COMPLETE unless every completion criterion above is fully satisfied.
When all criteria are satisfied, place STOCKWIKI_PHASE0_COMPLETE on its own line at the very end of the final response.
```

## Ralph Loop 실행 예시

아래 형식으로 시작하면 된다.

```text
/ralph-loop "<위 프롬프트 전체를 붙여넣기>" --max-iterations 20 --completion-promise "STOCKWIKI_PHASE0_COMPLETE"
```

## 운영 메모

- 이 프롬프트는 일부러 **질문 최소화 + phase 고정 + completion gate 명시** 형태로 작성했다.
- 첫 세션에서 기능 구현까지 밀어붙이면 이후 루프 품질이 급격히 떨어지므로, Phase 0만 고정한다.
- 다음 세션부터는 `docs/progress/current-phase.md` 와 `backlog.md` 를 기준으로 phase별 프롬프트를 좁게 작성한다.
