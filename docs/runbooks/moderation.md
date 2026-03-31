# Moderation Runbook

## Scope

Phase 0 에서는 실제 moderation queue 를 구현하지 않는다.
대신 later phase 에서 바로 확장할 수 있도록 운영 원칙과 최소 구조를 문서화한다.

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

## Phase 0 Operator Actions

- fake fixtures 만 사용한다.
- MediaWiki DB direct access 는 금지한다.
- 고위험 정책은 구현보다 문서와 테스트 구조로 먼저 남긴다.
- moderation 관련 TODO 는 반드시 `docs/progress/backlog.md` 에 기록한다.
