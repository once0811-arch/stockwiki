# Local Development Runbook

## Goal

Phase 4 citation and trust policy 완료 상태를 로컬에서 검증하고, 다음 Phase 5 discussion slice 진입 기준을 유지한다.

## Prerequisites

- Node.js 24.13.1 이상
- corepack-enabled pnpm 10.32.1 이상
- Docker Compose 사용 시 `docker` CLI 와 compose plugin 설치

## Commands

### Bootstrap

```bash
corepack pnpm install
```

### Verification

```bash
corepack pnpm lint:docs
corepack pnpm validate:docs
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm check
corepack pnpm --filter @stockwiki/wiki-bridge test
corepack pnpm --filter @stockwiki/workers typecheck
corepack pnpm --filter @stockwiki/workers test
corepack pnpm --filter @stockwiki/web typecheck
corepack pnpm --filter @stockwiki/web test -- tests/source-policy.test.ts tests/stock-page.test.tsx tests/edit-flow.test.ts
corepack pnpm --filter @stockwiki/web build
corepack pnpm --filter @stockwiki/web exec playwright install chromium
corepack pnpm --filter @stockwiki/web test:e2e
./scripts/hooks/guard-secrets.sh
./scripts/hooks/post-edit-check.sh
docker compose -f infra/compose/docker-compose.yml config
```

### If `pnpm` Is Not On PATH

```bash
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" node -v
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm -v
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm install
```

## What Was Actually Run In This Session

```bash
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" node -v
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm -v
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm install
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" pnpm check
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" pnpm build
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/web typecheck
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/workers typecheck
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/wiki-bridge test
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/web test -- tests/source-policy.test.ts tests/stock-page.test.tsx tests/edit-flow.test.ts
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/workers test
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/web build
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/web exec playwright install chromium
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/web test:e2e
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" ./scripts/hooks/post-edit-check.sh
./scripts/hooks/guard-secrets.sh
```

## Session Notes

- local Node 24.13.1 binary was installed under `~/.local/node-v24.13.1`
- `corepack pnpm --filter @stockwiki/web typecheck` passed
- `corepack pnpm --filter @stockwiki/workers typecheck` passed
- `corepack pnpm --filter @stockwiki/wiki-bridge test` passed
- `corepack pnpm --filter @stockwiki/web test -- tests/source-policy.test.ts tests/stock-page.test.tsx tests/edit-flow.test.ts` passed
- `corepack pnpm --filter @stockwiki/workers test` passed
- `corepack pnpm --filter @stockwiki/web build` passed
- `corepack pnpm --filter @stockwiki/web exec playwright install chromium` passed
- `corepack pnpm --filter @stockwiki/web test:e2e` passed
- `pnpm check` passed
- `pnpm build` passed
- `./scripts/hooks/post-edit-check.sh` passed
- `./scripts/hooks/guard-secrets.sh` passed
- `docker compose -f infra/compose/docker-compose.yml config` was not run because `docker` CLI was unavailable in this session

## Start Commands

```bash
corepack pnpm dev
corepack pnpm --filter @stockwiki/web dev
corepack pnpm --filter @stockwiki/api dev
corepack pnpm --filter @stockwiki/workers dev
```
