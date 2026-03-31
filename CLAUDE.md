@AGENTS.md

## Claude Code-specific notes

- 이 프로젝트의 공용 규약은 `AGENTS.md` 에 있다. 중복 규칙은 여기 적지 않는다.
- Claude Code는 항상 `docs/prd/stockwiki-prd.md` 를 소스 오브 트루스로 읽고 시작한다.
- built-in `Explore` / `Plan` subagent는 조사나 계획 분리에 적극 활용한다.
- 프로젝트 고유 subagent는 저장소 부트스트랩 이후 `.claude/agents/` 에 추가한다.
- auto memory는 보조 수단일 뿐이며, canonical progress는 반드시 저장소 문서(`docs/progress/*`)에 남긴다.
- Ralph Loop 사용 시 completion token 규칙은 `AGENTS.md` 를 따른다.
