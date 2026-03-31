# Moderation Runbook

## Scope

현재 저장소는 Phase 3에서 도입한 fake-first moderation queue 와 reviewer workflow 를 유지한다.
실제 persistence, abuse automation, sanctions 는 later phase 로 남겨둔다.

## Principles

- 정본 문서와 의견 토론을 분리한다.
- 공개 노출은 approved revision 기준으로 한다.
- 투자 권유, 선동, 허위 사실, 인신 공격은 초기에 구조적으로 차단한다.
- 고위험 종목, 인물 비방, 공시 해석 분쟁은 review 강화 대상이다.

## Planned Layers

1. 가입/인증 레이어: 이메일 검증, 기본 rate limit
2. 작성 전 검사: 금칙어, 과도한 링크, 출처 누락 경고
3. Wiki engine 규칙: AbuseFilter, FlaggedRevs, PageTriage
4. 앱 큐: pending edit review, reports, sanctions
5. 사후 대응: revert, lock, suspend, ban

## Current Phase 3 Operator Actions

- pending edit proposal 은 `/review/mod-queue` 에서 reviewer 가 approve/reject 한다.
- anonymous entry 는 `/login` demo login shell 을 통해 fake session 으로 이어진다.
- public page 는 approved revision 만 노출한다.
- approve/reject 는 fake-first reputation event 를 남긴다.
- fake session harness 와 in-memory queue 는 운영 구현이 아니므로 `docs/progress/backlog.md` 에 후속 치환 작업을 남긴다.
- MediaWiki DB direct access 는 계속 금지한다.

## Deferred Moderation Work

- abuse keyword / citation policy rule hooks
- moderator sanctions, warn/suspend/ban
- assignee, bulk actions, filter/sort, audit log persistence
- app DB backed queue and reputation event store
