# Local Development Runbook

## Goal

Phase 6 search shell 완료 상태를 로컬에서 검증하고, 다음 Phase 7 watchlist slice 진입 기준을 유지한다.

## Prerequisites

- Node.js 24.13.1 이상
- corepack-enabled pnpm 10.32.1 이상
- Docker Compose 사용 시 daemon 이 살아 있는 Docker runtime 필요

### Docker Runtime Notes

- Colima 를 쓰는 경우 `colima start` 로 runtime 을 띄운 뒤 `docker info` 가 성공해야 한다.
- compose smoke 는 `docker compose -f infra/compose/docker-compose.yml up -d` 와 `docker compose -f infra/compose/docker-compose.yml down` 까지 확인하는 것을 기준으로 삼는다.

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
corepack pnpm --filter @stockwiki/fixtures test
corepack pnpm --filter @stockwiki/web test -- tests/source-policy.test.ts tests/stock-page.test.tsx tests/edit-flow.test.ts tests/discussion-flow.test.ts tests/search-flow.test.ts
corepack pnpm --filter @stockwiki/web build
corepack pnpm --filter @stockwiki/web exec playwright install chromium
corepack pnpm --filter @stockwiki/web test:e2e
./scripts/hooks/guard-secrets.sh
./scripts/hooks/post-edit-check.sh
docker compose -f infra/compose/docker-compose.yml config
docker compose -f infra/compose/docker-compose.yml up -d
docker compose -f infra/compose/docker-compose.yml ps -a
docker exec compose-postgres-1 pg_isready -U stockwiki
docker exec compose-redis-1 redis-cli ping
curl -fsS http://localhost:9200
curl -fsS http://localhost:8081 >/dev/null && echo mediawiki-ok
curl -fsS http://localhost:8233 >/dev/null && echo temporal-ui-ok
docker compose -f infra/compose/docker-compose.yml down
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
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/fixtures test
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/workers typecheck
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/workers test
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/web typecheck
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/web test -- tests/search-flow.test.ts tests/stock-page.test.tsx
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" corepack pnpm --filter @stockwiki/web test:e2e
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" pnpm check
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" pnpm build
PATH="$HOME/.local/node-v24.13.1/bin:$PATH" ./scripts/hooks/post-edit-check.sh
./scripts/hooks/guard-secrets.sh
docker compose -f infra/compose/docker-compose.yml config
```

## Session Notes

- local Node 24.13.1 binary was installed under `~/.local/node-v24.13.1`
- Colima runtime was installed and `colima start` now brings up a working Docker daemon on this machine
- `corepack pnpm --filter @stockwiki/fixtures test` passed
- `corepack pnpm --filter @stockwiki/workers typecheck` passed
- `corepack pnpm --filter @stockwiki/workers test` passed
- `corepack pnpm --filter @stockwiki/web typecheck` passed
- `corepack pnpm --filter @stockwiki/web test -- tests/search-flow.test.ts tests/stock-page.test.tsx` passed
- `corepack pnpm --filter @stockwiki/web test:e2e` passed
- `pnpm check` passed
- `pnpm build` passed
- `./scripts/hooks/post-edit-check.sh` passed
- `./scripts/hooks/guard-secrets.sh` passed
- `docker compose -f infra/compose/docker-compose.yml config` passed
- Phase 6 search shell now exposes `/search`, `GET /api/public/search?q=`, alias-aware autocomplete, and search lag metrics from the shared fake-first indexing contract

## Start Commands

```bash
corepack pnpm dev
corepack pnpm --filter @stockwiki/web dev
corepack pnpm --filter @stockwiki/api dev
corepack pnpm --filter @stockwiki/workers dev
```
