# Local Development Runbook

## Goal

Phase 0 기준으로 StockWiki 하네스를 로컬에서 부트스트랩하고 최소 검증을 수행한다.

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
brew install docker docker-compose
docker compose version
docker compose -f infra/compose/docker-compose.yml config
```

## Session Notes

- `node -v` returned `v24.13.1`
- `pnpm -v` returned `10.32.1`
- `pnpm check` passed
- `pnpm build` passed
- `docker compose version` returned `Docker Compose version 5.1.1`
- `docker compose -f infra/compose/docker-compose.yml config` passed

## Start Commands

```bash
pnpm dev
pnpm --filter @stockwiki/web dev
pnpm --filter @stockwiki/api dev
pnpm --filter @stockwiki/workers dev
```
