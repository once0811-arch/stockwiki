# Local Development Runbook

## Goal

Phase 3 review workflow 완료 상태와 다음 Phase 4 진입 기준을 로컬에서 검증한다.

## Prerequisites

- Node.js 24.13.1 이상
- pnpm 10.32.1 이상
- Docker Compose 사용 시 `docker` CLI 와 compose plugin 설치

## Commands

### Bootstrap

```bash
pnpm install
```

### Verification

```bash
pnpm lint:docs
pnpm validate:docs
pnpm lint
pnpm typecheck
pnpm test
pnpm check
pnpm --filter @stockwiki/wiki-bridge test
pnpm --filter @stockwiki/wiki-bridge typecheck
pnpm --filter @stockwiki/workers test
pnpm --filter @stockwiki/workers typecheck
pnpm --filter @stockwiki/web typecheck
pnpm --filter @stockwiki/web test
pnpm build
pnpm --filter @stockwiki/web exec playwright install chromium
pnpm --filter @stockwiki/web test:e2e
./scripts/hooks/guard-secrets.sh
./scripts/hooks/post-edit-check.sh
docker compose -f infra/compose/docker-compose.yml config
```

### If Docker Compose Is Missing On macOS

```bash
brew install docker docker-compose
mkdir -p ~/.docker
```

`~/.docker/config.json`:

```json
{
  "cliPluginsExtraDirs": [
    "/opt/homebrew/lib/docker/cli-plugins"
  ]
}
```

## What Was Actually Run In This Session

```bash
node -v
pnpm -v
pnpm install
pnpm lint:docs
pnpm validate:docs
pnpm lint
pnpm typecheck
pnpm test
pnpm check
pnpm --filter @stockwiki/wiki-bridge test
pnpm --filter @stockwiki/wiki-bridge typecheck
pnpm --filter @stockwiki/workers test
pnpm --filter @stockwiki/workers typecheck
pnpm --filter @stockwiki/web test -- tests/edit-flow.test.ts
pnpm --filter @stockwiki/web test:e2e --grep "edit entry|pending edit proposal"
pnpm --filter @stockwiki/web test:e2e --grep "gates edit entry for anonymous and non-contributor users"
pnpm --filter @stockwiki/web test:e2e --grep "contributor edit to reviewer approval flow|reviewer reject"
pnpm --filter @stockwiki/web typecheck
pnpm --filter @stockwiki/web test
pnpm --filter @stockwiki/web build
pnpm build
pnpm --filter @stockwiki/web exec playwright install chromium
pnpm --filter @stockwiki/web test:e2e
./scripts/hooks/guard-secrets.sh
./scripts/hooks/post-edit-check.sh
brew install docker docker-compose
docker compose version
docker compose -f infra/compose/docker-compose.yml config
```

## Session Notes

- `node -v` returned `v24.13.1`
- `pnpm -v` returned `10.32.1`
- `pnpm check` passed
- `pnpm --filter @stockwiki/wiki-bridge test` passed
- `pnpm --filter @stockwiki/wiki-bridge typecheck` passed
- `pnpm --filter @stockwiki/workers test` passed
- `pnpm --filter @stockwiki/workers typecheck` passed
- `pnpm --filter @stockwiki/web test -- tests/edit-flow.test.ts` passed after implementing the Phase 3 slice
- `pnpm --filter @stockwiki/web test:e2e --grep "edit entry|pending edit proposal"` passed after implementing the Phase 3 slice
- `pnpm --filter @stockwiki/web test:e2e --grep "gates edit entry for anonymous and non-contributor users"` passed after adding the demo login shell
- `pnpm --filter @stockwiki/web test:e2e --grep "contributor edit to reviewer approval flow|reviewer reject"` passed when closing Phase 3
- `pnpm --filter @stockwiki/web typecheck` passed
- `pnpm --filter @stockwiki/web test` passed
- `pnpm --filter @stockwiki/web build` passed
- `pnpm build` passed
- `pnpm --filter @stockwiki/web test:e2e` passed
- `pnpm lint:docs` passed
- `pnpm validate:docs` passed
- `./scripts/hooks/guard-secrets.sh` passed
- `./scripts/hooks/post-edit-check.sh` passed
- `docker compose version` returned `Docker Compose version 5.1.1`
- `docker compose -f infra/compose/docker-compose.yml config` passed

## Start Commands

```bash
pnpm dev
pnpm --filter @stockwiki/web dev
pnpm --filter @stockwiki/api dev
pnpm --filter @stockwiki/workers dev
```
