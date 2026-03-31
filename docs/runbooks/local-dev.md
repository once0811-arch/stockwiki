# Local Development Runbook

## Goal

Phase 0 하네스와 현재 Phase 1 public read slice를 로컬에서 검증한다.

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
pnpm lint
pnpm typecheck
pnpm test
pnpm check
pnpm build
pnpm --filter @stockwiki/web exec playwright install chromium
pnpm --filter @stockwiki/web test:e2e
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
pnpm lint
pnpm typecheck
pnpm test
pnpm check
pnpm build
pnpm --filter @stockwiki/web exec playwright install chromium
pnpm --filter @stockwiki/web test:e2e
brew install docker docker-compose
docker compose version
docker compose -f infra/compose/docker-compose.yml config
```

## Session Notes

- `node -v` returned `v24.13.1`
- `pnpm -v` returned `10.32.1`
- `pnpm check` passed
- `pnpm build` passed
- `pnpm --filter @stockwiki/web test:e2e` passed
- `docker compose version` returned `Docker Compose version 5.1.1`
- `docker compose -f infra/compose/docker-compose.yml config` passed

## Start Commands

```bash
pnpm dev
pnpm --filter @stockwiki/web dev
pnpm --filter @stockwiki/api dev
pnpm --filter @stockwiki/workers dev
```
