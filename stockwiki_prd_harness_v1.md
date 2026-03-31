---
title: StockWiki PRD
version: 1.0
status: Ready for build
owner: OpenAI / User
language: ko-KR
agent_target: Claude Code
execution_style: harness-engineering
last_updated: 2026-03-31
---

# StockWiki PRD — 하네스 엔지니어링 기반 완전 기획+개발 문서

## 0. 이 문서의 목적과 사용법

이 문서는 **주식위키(StockWiki)** 를 처음부터 끝까지 구현하기 위한 단일 소스 오브 트루스(PRD)다.  
목표는 다음 두 가지를 동시에 만족하는 것이다.

1. **실제 서비스로 운영 가능한 제품/기술 기획서**일 것  
2. **Claude Code 같은 에이전트 코딩 도구가 순차적으로 구현하기 쉬운 실행 문서**일 것

이 문서는 일반적인 “아이디어 설명서”가 아니라, 다음을 포함하는 **빌드 스펙**이다.

- 제품 목표와 범위
- 핵심 UX와 정보 구조
- 권한/신뢰도/모더레이션 규칙
- 위키/토론/검색/데이터 연동 구조
- 권장 기술스택 및 서비스 경계
- 데이터 모델
- API 계약 요약
- 테스트 하네스와 평가 시나리오
- Claude Code용 실행 규칙
- 단계별 구현 순서와 종료 조건

### Claude Code용 운영 원칙

이 문서를 Claude Code에 넣을 때는 아래 원칙을 강제한다.

- 한 번에 전체 서비스를 만들지 말고 **수직 슬라이스(vertical slice)** 단위로 구현한다.
- 각 슬라이스는 반드시 **테스트, 문서, 실행 명령**까지 포함해 끝낸다.
- 애매한 요구사항이 있으면 임의로 넓게 해석하지 말고 **가장 단순하고 역전파 가능한 선택**을 한다.
- 이 문서와 구현이 충돌하면, 구현을 우선하지 말고 **ADR(Architecture Decision Record)** 로 차이를 기록한다.
- 외부 API, 실시간 시세, 실제 뉴스 연동은 초반부터 붙이지 말고 **픽스처/스텁 기반으로 먼저 완성**한다.
- MediaWiki는 **위키 코어 엔진**으로만 사용한다. 서비스 UI를 MediaWiki 스킨 중심으로 만들지 않는다.
- MediaWiki DB를 직접 읽지 않는다. 반드시 **공식 API 또는 브리지 계층**을 통해 접근한다.
- 모든 “항상 실행되어야 하는 규칙”은 프롬프트가 아니라 **훅(hooks), 테스트, 타입, CI** 로 강제한다.

---

## 1. 왜 이 서비스가 필요한가

주식 관련 정보 서비스는 많지만, 대부분은 아래 셋 중 하나에 치우친다.

1. **뉴스/속보 소비형**
2. **토론/커뮤니티 감정형**
3. **브로커리지/차트 중심형**

반면 투자자가 실제로 반복적으로 찾는 정보는 대체로 다음과 같다.

- 이 회사가 정확히 무엇을 하는지
- 매출 구조가 어떻게 되는지
- 핵심 이슈와 리스크가 무엇인지
- 최근 공시/실적/뉴스가 어떤 문맥 위에 놓이는지
- 특정 테마나 산업 내에서 어떤 위치인지
- 과거에 무슨 일이 있었고 지금 무엇이 바뀌었는지

이 정보는 “실시간 채팅”보다 **지속적으로 갱신되는 문서**에 더 잘 맞는다.  
즉, 주식 서비스에서 빠르게 사라지는 피드보다 오래 남는 **집단지성형 지식 자산**이 필요하다.

### 제품 한 줄 정의

**StockWiki는 종목·기업·산업·테마 정보를 구조화된 문서로 축적하고, 토론과 검수를 통해 신뢰도를 높이는 참여형 주식 지식 플랫폼이다.**

---

## 2. 벤치마크 학습 요약과 제품 설계 시사점

현재 대규모 위키/커뮤니티 서비스에서 배울 점은 기능 하나가 아니라 **운영 구조**다.

### 2.1 관찰 요약

#### Wikipedia / MediaWiki 계열에서 배울 점
- 위키는 대규모 트래픽과 대규모 문서 수를 감당할 수 있어야 한다.
- 문서의 핵심은 보기 좋은 편집기가 아니라 **리비전 히스토리, diff, 출처, 토론, 되돌리기, 검수**다.
- 공개형 지식 서비스는 “마지막 편집본”보다 “마지막 검수본”이 더 중요할 수 있다.
- 토론은 문서 본문과 분리되어야 하며, 본문은 사실 중심, 토론은 합의/분쟁 해결 중심으로 다뤄져야 한다.

#### Fandom에서 배울 점
- 특정 주제에 대한 팬/전문가 커뮤니티는 **템플릿, 인포박스, 카테고리, 내부 링크 구조**를 통해 문서의 깊이를 만든다.
- 세로형(vertical) 커뮤니티에서는 정보 밀도와 반복 방문 이유를 만드는 것이 중요하다.
- 같은 주제라도 “구조화된 메타데이터 + 자유 서술형 본문”의 조합이 강하다.

#### Reddit에서 배울 점
- 커뮤니티는 좋은 글보다 **좋은 운영 도구**가 오래간다.
- 규칙, 신고, 모더레이션 큐, 자동화(AutoModerator), 권한 분리가 있어야 규모가 커진다.
- 의견 표출은 투표와 카르마처럼 단순한 메커니즘이 잘 작동하지만, **사실 문서의 진실성**을 다수결에 맡기면 안 된다.
- 따라서 “토론 레이어”에는 Reddit식 신호를 쓰되, “정본 문서 레이어”에는 쓰지 않는 분리가 적절하다.

#### Stack Overflow에서 배울 점
- 신뢰도는 추상적인 감이 아니라 **권한 상승 시스템**으로 구현해야 한다.
- 기여가 누적되면 더 많은 편집/검수/정리 권한을 얻는 구조가 자율 운영에 유리하다.
- 리뷰 권한과 일반 참여 권한을 섞지 말고 단계적으로 승격해야 한다.

#### NamuWiki에서 배울 점
- 한국어권에서도 참여형 지식 서비스에 대한 대규모 수요가 존재한다.
- 다만 정치/연예/사회 이슈보다 주식은 허위 정보, 선동, 이해상충, 명예훼손, 시장 교란 리스크가 더 크므로 더 강한 운영 장치가 필요하다.

#### Claude Code / Harness Engineering 관점에서 배울 점
- 장문 프롬프트보다 **프로젝트 메모리(CLAUDE.md)**, **훅**, **스킬**, **테스트 하네스**가 더 중요하다.
- 에이전트는 “무엇을 만들지”보다 “어떤 제약 안에서 어떻게 확인할지”가 명확할 때 품질이 올라간다.
- 따라서 PRD는 사람이 읽기 좋기만 하면 안 되고, **기계가 오해 없이 순차 구현 가능한 형태**여야 한다.

### 2.2 StockWiki에 반영할 설계 원칙

1. **정본 문서와 의견 토론을 분리한다.**
   - 위키 본문은 사실·출처 중심
   - 토론/댓글은 의견·논쟁 중심

2. **구조화 데이터와 자유 서술을 분리한다.**
   - 주가, 시총, 상장일, 시장구분, 산업분류 등은 시스템이 관리
   - 사업 구조, 경쟁 환경, 리스크, 사건 맥락은 커뮤니티가 관리

3. **공개 읽기, 단계적 쓰기, 검수 기반 노출**을 기본으로 한다.
   - 누구나 읽을 수 있다.
   - 쓰기는 이메일/소셜 인증 후 가능하다.
   - 초반에는 검수본을 기본 노출한다.

4. **권한은 역할이 아니라 기여와 신뢰 누적으로 얻는다.**
   - Stack Overflow식 권한 승급 모델 채택
   - 단, 투자 커뮤니티 특성상 검수 권한은 더 보수적으로 부여

5. **모더레이션은 인력에만 의존하지 않는다.**
   - 신고/큐/자동 규칙/차단/되돌리기/페이지 잠금
   - 신입 사용자와 고위험 페이지는 별도 흐름

6. **하네스 우선으로 개발한다.**
   - MediaWiki 실제 연동 이전에 FakeWikiEngine으로 먼저 완성
   - 실시간 시세 이전에 FixtureMarketDataProvider로 먼저 완성
   - 규칙은 CLAUDE.md가 아니라 hooks/tests/schema에 반영

---

## 3. 제품 비전, 포지셔닝, 핵심 원칙

### 3.1 비전

장기적으로 StockWiki는 “주식판 Wikipedia”가 아니라  
**“한국어권에서 가장 구조화된 상장사 지식 그래프 + 참여형 리서치 위키”**가 된다.

### 3.2 포지셔닝

StockWiki는 아래와 다르다.

- **브로커리지 앱이 아니다.**
- **실시간 매매 채팅방이 아니다.**
- **종목 추천 서비스가 아니다.**
- **애널리스트 리포트 판매 서비스가 아니다.**

StockWiki는 아래에 가깝다.

- 투자자가 반복적으로 찾아오는 “정리된 종목 문서”
- 사건이 생길 때 가장 먼저 업데이트되는 “문맥 저장소”
- 커뮤니티가 보완하고 검수하는 “지속 업데이트형 투자 백과”

### 3.3 제품 원칙

1. **사실과 의견을 섞지 않는다.**
2. **구조화 가능한 것은 구조화한다.**
3. **편집 자유보다 독자 신뢰를 우선한다.**
4. **최신성보다 검수 가능성을 함께 본다.**
5. **외부 데이터 의존은 인터페이스로 격리한다.**
6. **초기 구현은 단순하게, 운영 장치는 강하게 간다.**

---

## 4. 목표와 비목표

### 4.1 제품 목표

#### P0
- 누구나 읽을 수 있는 공개형 종목 위키를 제공한다.
- 커뮤니티가 문서를 편집하고 수정 제안을 보낼 수 있게 한다.
- 검수/되돌리기/신고/차단이 가능한 운영 체계를 갖춘다.
- 종목 문서와 토론, 기본 데이터 카드, 검색을 연결한다.

#### P1
- 산업/테마/인물/이벤트 페이지로 확장한다.
- 종목 watchlist와 알림을 제공한다.
- 검색과 내부 링크 추천을 고도화한다.
- 기여도 기반 권한 승급 체계를 안정화한다.

#### P2
- 고급 리서치 도구(비교표, 관계 그래프, 이벤트 타임라인 확장)
- 다국어/영문 페이지
- API/데이터 라이선싱
- 모바일 앱

### 4.2 비목표
- 자동매매 기능
- 투자일임/자문/종목 추천
- 실시간 익명 채팅
- 유료 리포트 판매
- 일반 SNS형 피드 타임라인
- 무제한 사용자 이미지 업로드

---

## 5. 핵심 사용자와 JTBD

### 5.1 사용자 세그먼트

#### A. 리서치형 개인투자자
- 특정 종목을 깊게 파고드는 사용자
- 공시/IR/사업구조/리스크를 정리해서 보길 원함

#### B. 이슈 추적형 투자자
- 테마주, 급등주, 이벤트 드리븐 종목을 빠르게 따라가고 싶어함
- “무슨 일인지 한 문서에서 이해”하고 싶어함

#### C. 기여형 편집자
- 정리하고 수정하고 링크를 엮는 데서 재미를 느끼는 사용자
- 권한 상승과 영향력에 동기부여됨

#### D. 검수자/모더레이터
- 문서 품질과 운영 안정성을 책임지는 사용자
- 신고 처리, 편집 승인, 분쟁 해결이 중요함

### 5.2 대표 JTBD

- “이 회사가 정확히 뭘 하는지 3분 안에 이해하고 싶다.”
- “실적 발표 전에 이 회사의 핵심 변수와 리스크를 정리해서 보고 싶다.”
- “이 이슈가 왜 중요한지 과거 사건 맥락까지 한 페이지에서 보고 싶다.”
- “잘못된 내용이나 선동성 문구를 빠르게 수정하고 싶다.”
- “내가 기여한 편집이 서비스 품질에 실제로 반영되는 걸 보고 싶다.”

---

## 6. 성공 지표

### 6.1 제품 KPI
- 월간 활성 독자(MAU Reader)
- 주간 활성 기여자(WAU Contributor)
- 페이지당 평균 체류시간
- 검색 후 클릭률
- 재방문율(D7 / D30)
- watchlist 생성률

### 6.2 콘텐츠 품질 KPI
- 문서당 평균 출처 수
- 검수 완료 문서 비중
- 수정 제안 대비 승인률
- 되돌리기율(revert rate)
- 출처 없는 문장 비중
- 최신 공시/실적 이후 업데이트 지연시간

### 6.3 운영 KPI
- 모더레이션 큐 적체 시간
- 신고 처리 SLA
- 허위/훼손 편집 노출 시간
- 자동 탐지 적중률
- 페이지 잠금/보호 빈도

### 6.4 기술 KPI
- 공개 종목 페이지 p95 응답시간
- 검색 자동완성 p95 지연
- 인덱싱 지연 시간
- MediaWiki 브리지 실패율
- 워크플로우 재시도 성공률

---

## 7. 핵심 제품 구조

## 7.1 콘텐츠 레이어를 세 층으로 나눈다

### Layer A — 시스템 관리 데이터
시세, 시총, 시장, 업종, 상장일, 종목코드, 공식 홈페이지, 기본 재무 요약 등  
**사용자가 직접 편집하지 않는 구조화 데이터**

### Layer B — 정본 위키 문서
사업 설명, 제품/서비스, 매출 구조, 경쟁 환경, 성장 동력, 주요 리스크, 주요 사건, 지배구조 등  
**커뮤니티가 편집하지만 출처와 검수가 필요한 문서**

### Layer C — 토론/해석 레이어
의견, 해석, 수정 제안, 논쟁, 섹션 개선 아이디어, 최신 이슈 토론  
**Reddit형 상호작용을 일부 도입하는 커뮤니티 레이어**

## 7.2 중요한 정책적 분리

- **주가/시총/거래량 등 수치 데이터는 위키 본문에서 수동 편집 금지**
- **추천/매수/매도/목표가 같은 표현은 정본 문서에서 금지**
- **사실 주장에는 출처 요구**
- **의견은 토론으로 이동**
- **공개 독자에게는 “최신 편집본”이 아니라 “최신 검수본”을 기본 노출**

---

## 8. 정보 구조(IA)와 페이지 타입

### 8.1 1차 페이지 타입

#### 1) 종목 페이지
예: `KRX 005930 삼성전자`

구성:
- 헤더
- 시스템 데이터 카드
- 위키 본문
- 최신 변경 내역
- 토론 미리보기
- 이벤트/공시/뉴스 타임라인
- 관련 페이지 링크

#### 2) 산업 페이지
예: `반도체 장비`, `2차전지 소재`

#### 3) 테마 페이지
예: `AI 데이터센터`, `원전`, `방산`

#### 4) 인물 페이지
예: 대표이사, 창업자, 대주주

#### 5) 이벤트 페이지
예: 합병, 상장폐지, 대규모 유상증자, 회계 이슈

### 8.2 종목 페이지 기본 탭

- 개요
- 위키
- 토론
- 히스토리
- 변경비교(Diff)
- 출처
- 관련 이벤트

### 8.3 주요 라우트 규약

```text
/
 /search
 /stocks
 /stocks/[market]/[ticker]
 /stocks/[market]/[ticker]/wiki
 /stocks/[market]/[ticker]/discussion
 /stocks/[market]/[ticker]/history
 /stocks/[market]/[ticker]/diff/[from]...[to]
 /stocks/[market]/[ticker]/sources
 /stocks/[market]/[ticker]/edit
 /themes/[slug]
 /industries/[slug]
 /people/[slug]
 /events/[slug]
 /u/[handle]
 /me/watchlist
 /admin/modqueue
 /admin/reports
 /admin/pages/[pageId]
```

### 8.4 URL 원칙
- 종목의 canonical key는 `{market}:{ticker}` 로 고정한다.
- slug는 SEO/가독성용이며 lookup의 1차 키가 아니다.
- 예: `/stocks/krx/005930-samsung-electronics`
- 종목명 변경이 있어도 ticker 기반 canonical을 유지한다.

---

## 9. 종목 페이지 UX 스펙

## 9.1 읽기 화면

### 헤더
- 회사명
- 티커
- 거래소
- 상태 태그(정상 / 거래정지 / 관리종목 / 상장폐지 등)
- watchlist 버튼
- 편집 버튼
- 신고 버튼

### 시스템 데이터 카드
- 현재가 / 기준시각
- 전일 대비
- 시가총액
- 섹터 / 산업
- 상장일
- 본사 / 국가
- 공식 사이트 / IR
- 최근 실적 발표일
- 최신 공시 수

> 시스템 데이터는 별도 데이터 파이프라인에서 공급되며, 커뮤니티 편집 대상이 아니다.

### 문서 본문 기본 섹션
- 한줄 요약
- 회사 개요
- 사업 구조
- 주요 제품/서비스
- 매출/이익 구조
- 산업 내 위치와 경쟁
- 성장 동력
- 핵심 리스크
- 최근 주요 이벤트
- 지배구조 / 경영진
- 참고 출처

### 보조 패널
- 마지막 검수 시각
- 마지막 편집 시각
- 신뢰도 배지
- 기여자
- 관련 문서 링크
- 최신 토론 스레드

## 9.2 편집 버튼 동작

읽기 화면에서 “편집” 클릭 시 아래 규칙을 따른다.

- 비로그인: 로그인/가입 유도
- 로그인했지만 contributor 자격 없음: 온보딩/커뮤니티 규칙 확인 후 요청
- contributor 이상: 편집 화면 진입
- 검수자 이상: 승인/거절/롤백 도구도 함께 제공

## 9.3 편집 UX 원칙

### V1 원칙
- **공개 읽기 UI는 완전 커스텀**
- **편집 UX는 MediaWiki VisualEditor / Source Editor를 활용한 하이브리드**
- 서비스는 MediaWiki 편집 화면으로 deep-link 또는 controlled shell 방식으로 이동할 수 있다
- 향후 V2에서 ProseMirror/Tiptap 기반 커스텀 에디터를 검토한다

이 선택의 이유:
- 읽기 UX는 SEO/브랜딩/데이터 통합 때문에 커스텀이 낫다
- 편집 UX는 처음부터 자체 구현보다 MediaWiki 자산 재사용이 더 효율적이다

---

## 10. 기능 요구사항 상세

## 10.1 인증과 계정

### 필수 요구사항
- 이메일 기반 가입
- 소셜 로그인(최소 Google, Kakao 중 1개 이상)
- 이메일 인증 필수
- 닉네임/핸들 설정
- 기본 프로필 페이지
- 약관/커뮤니티 규칙 동의

### 권장 요구사항
- 2FA(운영자/검수자 필수)
- 계정 정지/차단 상태 관리
- 역할/권한 동기화

### 권한 레벨
1. Reader
2. Member
3. Contributor
4. Trusted Contributor
5. Reviewer
6. Moderator
7. Admin

## 10.2 온보딩

Contributor가 되기 전 최소 온보딩이 필요하다.

- 커뮤니티 규칙 확인
- 출처 정책 확인
- 정본 문서와 토론의 차이 이해
- 기본 편집 가이드 확인

선택사항:
- 짧은 튜토리얼 편집 과제
- 자동 승인 대신 첫 1~3회 편집은 검수 대기

## 10.3 문서 생성

### 종목 페이지
- 시스템 내 종목 마스터가 있으면 자동 생성 가능
- 첫 방문 시 skeleton 생성 가능
- 템플릿 기반 섹션 자동 생성

### 비종목 페이지
- Contributor 이상이 생성 가능
- 고위험 주제(정치/인물/분쟁)는 reviewer 이상만 생성 가능하도록 확장 가능

## 10.4 문서 편집

### 요구사항
- 섹션 단위 편집
- 미리보기
- edit summary 필수
- 출처 추가 유도
- 저장 전 금칙어/스팸 규칙 검사
- 편집 충돌 안내
- 저장 후 history 생성
- pending review 상태 반영

### 저장 정책
- 일반 contributor 편집은 기본적으로 **pending revision**
- public default revision은 마지막 approved revision
- reviewer가 approve 하면 public revision 갱신

## 10.5 히스토리와 diff

### 요구사항
- 모든 편집에 대해 revision 생성
- revision 비교(diff) 지원
- 롤백/되돌리기 지원
- edit summary 표시
- 작성자, 시각, 변경량 표시
- approved / pending / reverted 상태 표시

### 중요 원칙
- 독자는 최신 검수본을 보되, 히스토리에서 최신 편집 제안을 확인할 수 있어야 한다
- 검수자는 pending diff를 빠르게 검토할 수 있어야 한다

## 10.6 출처와 인용

### 정본 문서 정책
- 사실 주장에는 가능한 한 inline citation 요구
- 최소한 섹션 단위 출처는 필수
- 다음 내용은 반드시 출처 필요:
  - 숫자와 비율
  - 실적/가이던스/공시 관련 주장
  - 논쟁적 주장
  - 인물 관련 부정적 주장
  - 최근 사건 사실관계

### 허용 출처 우선순위
- Tier 1: 거래소 공시, SEC/금감원/기업 IR/사업보고서 등 1차 공식 출처
- Tier 2: 신뢰 가능한 주요 언론, 공식 인터뷰, 실적 발표 transcript
- Tier 3: 시장 데이터 공급자, 산업 리서치(라이선스 검토 필요)
- Tier 4: 커뮤니티 글, 블로그, SNS — 정본 본문에는 원칙적으로 금지 또는 제한

### UI 요구사항
- ref 삽입 도구
- 참고문헌 목록 자동 렌더
- 출처 없는 섹션 경고 배지
- 오래된 출처(예: 24개월+) 경고
- dead link / 404 링크 검출 작업

## 10.7 토론 시스템

### V1 원칙
- MediaWiki talk page를 사용자 기본 UX로 쓰지 않는다
- **토론은 앱 자체 시스템**으로 구현한다
- 이유:
  - Reddit/포럼형 스레드 UX가 더 적합
  - 권한/신고/투표/정렬을 커스텀하기 쉽다
  - Structured Discussions는 더 이상 권장되지 않는다

### 기능
- 페이지별 스레드
- 주제별 댓글 스레드
- upvote/downvote 또는 “도움됨” 반응
- 신고
- 고정/잠금
- 해결됨 표시
- 수정 제안 링크
- 문서 섹션과 토론 연결

### 정책
- 토론은 의견 허용
- 정본 문서 수준의 엄격한 출처 의무는 없지만, 사실 주장은 출처 요구 가능
- 비방/허위사실/주가 선동은 제재 대상

## 10.8 신뢰도/기여도 시스템

### 목적
- 좋은 기여자를 더 많은 권한으로 승급
- 운영 부담을 사람이 일일이 판단하지 않고 규칙화
- 악의적 계정의 영향력 제한

### 점수 예시
- 승인된 편집 +5
- 출처 추가 +2
- 신고 적중 +3
- 되돌려진 편집 -5
- 스팸/제재 -가중 패널티

### 권한 예시
- Member: 토론/신고/프로필
- Contributor: 편집 제안 가능
- Trusted Contributor: 일부 저위험 페이지의 빠른 반영 후보
- Reviewer: 승인/거절/경미 롤백
- Moderator: 차단/잠금/신고 처리
- Admin: 시스템 설정

### 설계 원칙
- Reddit식 카르마를 그대로 문서 권한으로 쓰지 않는다
- 토론 인기와 문서 신뢰는 별개로 관리한다

## 10.9 모더레이션 큐

### 큐 유형
- pending edits
- reported comments
- reported pages
- suspected vandalism
- new page review
- source quality flags
- legal escalation

### 필수 기능
- 항목 리스트
- diff 미리보기
- 컨텍스트 보기
- approve / reject / revert
- page lock
- user warn / suspend / ban
- 이유 코드 기록
- bulk actions
- filter / sort / assignee

### 자동화 룰 예시
- 신규 계정의 외부 링크 다수 편집 → review 강제
- 소형주 페이지에서 “무조건 간다”, “떡상”, “작전” 등 특정 문구 포함 → flag
- 짧은 시간 대량 편집 → rate limit / queue
- 인물 관련 부정적 내용인데 citation 없음 → block or queue

## 10.10 신고 시스템

신고 사유:
- 허위 정보
- 출처 없음
- 광고/스팸
- 명예훼손
- 혐오/비방
- 주가 선동
- 저작권 문제
- 기타

### 요구사항
- 신고 시 스냅샷 보존
- 신고 처리 로그 보존
- 반복 신고 악용 방지
- moderator notes 기록

## 10.11 검색

### 검색 대상
- 종목명
- 티커
- 약어/별칭
- 산업/테마/인물 페이지
- 위키 본문
- 토론 제목

### 랭킹 원칙
1. exact ticker match
2. canonical stock page
3. alias match
4. title match
5. high-quality page boost
6. recent activity boost (보조)
7. discussion results (하단)

### 기능
- 자동완성
- 최근 검색
- 필터(종목/산업/테마/인물)
- 오타 보정
- 내부 링크 추천

## 10.12 watchlist / 알림

### watchlist 기능
- 사용자가 종목/페이지를 구독
- 변경, 검수 완료, 토론 답글, 주요 이벤트 발생 시 알림

### 알림 채널
- 인앱
- 이메일 digest
- 추후 웹푸시

## 10.13 관리자 도구

- 페이지 보호 수준 조정
- 특정 섹션 lock
- 사용자 차단 / 음소거 / 제한
- 금칙어 룰
- 링크 allowlist/denylist
- 모더레이션 SLA 대시보드
- review backlog
- source quality report
- stale page report

---

## 11. StockWiki만의 핵심 정책

## 11.1 정본 문서는 “투자 판단 유도문”을 금지한다

정본 위키 본문에서는 다음을 금지한다.

- “매수해야 한다”
- “곧 몇 배 간다”
- “세력이 붙었다”
- “무조건 오른다”
- “목표가 xx원”

이런 표현은 토론으로 이동시키되, 커뮤니티 규칙 위반 여부를 따로 판단한다.

## 11.2 구조화 데이터는 사용자 편집 금지

다음 항목은 커뮤니티가 직접 손대지 않는다.

- 현재가
- 시총
- 거래대금
- 상장 시장
- 종목코드
- 최근 실적 수치 원데이터
- 공시 원문 링크

이 항목은 시스템 데이터 파이프라인이 공급한다.  
사용자는 “이 값이 틀렸다”는 신고나 issue 제기는 가능하지만 직접 수정하지 않는다.

## 11.3 고위험 콘텐츠 보호 규칙

다음 경우는 기본적으로 review 강제 또는 보호 수준 강화:

- 급등락 중인 소형주
- 횡령/배임/형사 사건
- 대표이사/오너 관련 비리 주장
- 공시 해석 논쟁
- 합병, 유상증자, 상장폐지, 거래정지

## 11.4 stale content 배지

- 마지막 검수 시점이 오래됐거나
- 최근 중요 공시/실적 이후 문서 업데이트가 없으면
- 페이지 상단에 “업데이트 필요” 배지를 노출한다

---

## 12. 기술 전략

## 12.1 권장 아키텍처 한 줄 요약

**MediaWiki를 문서 코어 엔진으로 사용하고, Next.js + NestJS 기반의 별도 서비스 레이어가 읽기 UX, 토론, 검색, 알림, 권한, 모더레이션, 데이터 통합을 담당하는 하이브리드 구조를 채택한다.**

## 12.2 서비스 경계

### A. Web App
- Next.js
- 공개 페이지, 검색, 토론, 계정, 관리자 UI
- SEO/SSR/ISR 담당

### B. BFF / App API
- NestJS
- 사용자/권한/토론/신고/알림/watchlist/검색 조합 API
- MediaWiki 브리지 호출
- provider adapter 호출

### C. Wiki Engine
- MediaWiki
- 문서 저장, 리비전, diff, rollback, 검수 확장
- VisualEditor / Source editor
- Cite, AbuseFilter, FlaggedRevs, PageTriage 등

### D. Service DB
- PostgreSQL
- 앱 도메인 데이터 저장
- users, reputation, discussions, reports, watchlist, notifications, outbox 등

### E. Cache / Rate limit
- Redis

### F. Search
- OpenSearch
- 본문/제목/별칭/티커/토론 검색

### G. Workflow Engine
- Temporal
- 데이터 수집, 인덱싱, 알림, moderation scoring, dead-link scan

### H. Object Storage
- S3-compatible
- 문서 첨부/운영 산출물/백업
- 단, V1에서는 end-user 자유 업로드를 제한

### I. Analytics
- V1: Postgres + product analytics events
- V2: ClickHouse 도입 가능

## 12.3 아키텍처 원칙

### 1) MediaWiki DB 직접 접근 금지
앱은 MediaWiki 내부 테이블을 직접 join하거나 읽지 않는다.  
반드시 공식 REST API / Action API / 인증된 브리지 계층을 사용한다.

### 2) 외부 연동은 인터페이스 뒤로 숨긴다
- `WikiEngine`
- `MarketDataProvider`
- `NewsProvider`
- `SearchIndexer`
- `NotificationSender`

각 인터페이스는 Fake 구현을 먼저 만든다.

### 3) 읽기 모델은 앱이 조합한다
공개 종목 페이지는 다음을 조합해 렌더한다.

- 시스템 데이터 카드
- 검수된 위키 HTML
- 최신 변경 정보
- 토론 요약
- 이벤트 타임라인

즉, MediaWiki 페이지를 그대로 서비스 전면에 노출하지 않는다.

### 4) 이벤트/작업은 outbox + workflow로 처리한다
Kafka 같은 대규모 메시지 버스는 V1에서 쓰지 않는다.  
Postgres outbox + Temporal worker 조합으로 충분하다.

---

## 13. 구체 기술 스택

### 13.1 프론트엔드
- Next.js (App Router)
- TypeScript
- React Server Components + Client Components 혼합
- SSR/ISR 활용
- 디자인 시스템은 shadcn/ui 계열 또는 자체 컴포넌트
- 상태 관리:
  - 서버 상태: React Query/TanStack Query 계열
  - 클라이언트 UI 상태: local state / lightweight store

### 13.2 백엔드
- NestJS
- TypeScript
- OpenAPI 자동 문서화
- 서비스 계층과 어댑터 계층 분리

### 13.3 DB
- PostgreSQL
- 앱 도메인 전용
- SQL migration 필수
- soft delete보다 audit log 우선
- outbox table 사용

### 13.4 캐시/큐 보조
- Redis
- rate limit
- cache
- session helper
- short-lived derived counters

### 13.5 검색
- OpenSearch
- index:
  - stock_pages
  - wiki_pages
  - discussions
  - aliases
- 한글 형태소 분석은 운영 환경에 맞춰 구성
- synonym / ticker / alias 사전 유지

### 13.6 위키 엔진
- MediaWiki
- 필수 확장 권장:
  - REST API / Action API 사용
  - VisualEditor
  - Cite
  - AbuseFilter
  - FlaggedRevs
  - PageTriage
  - OpenID Connect + PluggableAuth
  - OATHAuth(운영자 2FA)
- 선택 확장:
  - Moderation (운영 성숙도와 충돌 검토 후)

### 13.7 워크플로우
- Temporal
- 잡 예시:
  - market data sync
  - news ingestion
  - recent changes poller
  - search reindex
  - dead link checker
  - digest mailer
  - stale page scorer
  - moderation auto-score

### 13.8 인프라
- 로컬: Docker Compose
- 운영: Kubernetes 또는 managed container platform
- reverse proxy / ingress
- secrets manager
- IaC는 Terraform 또는 동등 도구

### 13.9 관측성
- OpenTelemetry
- Prometheus + Grafana
- Sentry
- 구조화 JSON 로그

---

## 14. MediaWiki 통합 설계

## 14.1 중요한 결정

### 결정 1: 읽기 UI는 커스텀, 편집 엔진은 MediaWiki
- public read = custom Next.js page
- edit = MediaWiki-backed flow
- history/diff = 가능하면 custom shell + MediaWiki data
- deep integration이 막히면 V1에서는 MediaWiki native history/diff를 브랜딩한 shell로 감싼다

### 결정 2: 토론은 자체 구현
- MediaWiki의 기본 토론 도구를 주 UX로 사용하지 않는다
- Structured Discussions는 사용하지 않는다
- 커뮤니티 토론은 별도 서비스 레이어에서 구현한다

### 결정 3: stable revision 노출
- public default = approved revision
- pending edits = reviewer workflow에서 검토
- trusted contributors는 일부 빠른 경로를 가질 수 있으나, 공개 반영은 정책적으로 통제

## 14.2 WikiEngine 인터페이스(개념 계약)

```ts
interface WikiEngine {
  getPage(key: PageKey): Promise<PageContent>
  getRenderedHtml(key: PageKey, revision?: RevisionId): Promise<RenderedPage>
  getHistory(key: PageKey, params?: HistoryQuery): Promise<PageRevision[]>
  compareRevisions(key: PageKey, from: RevisionId, to: RevisionId): Promise<DiffResult>
  createOrUpdatePage(input: EditPageInput): Promise<EditResult>
  rollback(input: RollbackInput): Promise<RollbackResult>
  protectPage(input: ProtectPageInput): Promise<void>
  getRecentChanges(cursor?: string): Promise<RecentChangeBatch>
}
```

### 구현체
- `FakeWikiEngine`
- `MediaWikiEngine`

원칙:
- 프론트/백엔드는 `WikiEngine` 만 의존한다
- MediaWiki가 막혀도 제품 개발은 계속 가능해야 한다

## 14.3 페이지 타이틀 규약

```text
Stocks/KRX/005930/Samsung_Electronics
Stocks/NASDAQ/NVDA/NVIDIA
Themes/AI_Data_Center
Industries/Semiconductor_Equipment
People/Jensen_Huang
Events/2026-02-NVDA-Earnings
```

앱 내부 canonical key는 더 단순하게 유지한다.

```text
stock:krx:005930
stock:nasdaq:nvda
theme:ai-data-center
```

## 14.4 MediaWiki 인증 전략

- 서비스와 MediaWiki는 같은 OIDC IdP를 사용한다
- SSO 후 사용자 identity를 양쪽에 매핑한다
- MediaWiki user provisioning은 first-login 시 자동 생성 가능
- 역할 그룹 동기화는 app role → MediaWiki group mapping으로 처리

원칙:
- 위키 엔진이 별도 로그인 섬(island)이 되면 안 된다
- 세션 경험은 가능한 한 하나처럼 보이게 한다

---

## 15. 앱 데이터 모델

## 15.1 핵심 엔티티

### users
- id
- email
- handle
- display_name
- status
- role
- reputation_score
- created_at
- updated_at

### user_profiles
- user_id
- bio
- avatar_url
- locale
- notification_prefs
- disclosures

### stock_master
- id
- market
- ticker
- name_ko
- name_en
- slug
- sector
- industry
- country
- official_site
- ir_site
- status
- canonical_page_key

### market_snapshots
- stock_id
- as_of
- price
- change
- change_pct
- market_cap
- volume
- source
- raw_payload

### wiki_page_registry
- id
- page_type
- canonical_key
- mediawiki_title
- stock_id nullable
- status
- protection_level
- last_reviewed_revision_id
- last_seen_revision_id
- last_reviewed_at
- last_edited_at

### wiki_revision_shadow
앱이 자주 써야 하는 metadata를 캐시/섀도우로 저장한다.
- id
- page_registry_id
- revision_id
- author_user_id nullable
- status (pending/approved/rejected/reverted)
- summary
- created_at

### sources_catalog
선택적 structured source registry
- id
- url
- domain
- title
- published_at
- source_tier
- status
- normalized_url
- created_by

### discussion_threads
- id
- page_registry_id
- section_anchor nullable
- title
- status
- created_by
- created_at
- updated_at

### discussion_comments
- id
- thread_id
- parent_comment_id nullable
- body_markdown
- body_html
- score
- created_by
- created_at
- updated_at
- status

### votes
- id
- user_id
- target_type
- target_id
- value

### reports
- id
- reporter_user_id
- target_type
- target_id
- reason_code
- details
- status
- assigned_to
- created_at
- resolved_at

### moderation_cases
- id
- case_type
- reference_type
- reference_id
- priority
- auto_score
- state
- assignee
- resolution_code
- notes
- created_at
- updated_at

### watchlists
- id
- user_id
- target_type
- target_id
- created_at

### notifications
- id
- user_id
- type
- payload
- read_at
- created_at

### reputation_events
- id
- user_id
- event_type
- delta
- ref_type
- ref_id
- created_at

### outbox_events
- id
- topic
- payload_json
- status
- created_at
- processed_at

## 15.2 명시적 비정규화 원칙

- MediaWiki의 full revision content는 MediaWiki에 둔다
- 앱 DB에는 필요한 metadata만 shadowing 한다
- search/read optimization용 denormalized table은 허용
- 단, 원본 책임(source of truth)을 흐리지 않는다

---

## 16. API 계약 요약

## 16.1 Public Read API

```text
GET /api/public/stocks/:market/:ticker
GET /api/public/stocks/:market/:ticker/wiki
GET /api/public/stocks/:market/:ticker/history
GET /api/public/stocks/:market/:ticker/diff?from=&to=
GET /api/public/stocks/:market/:ticker/discussions
GET /api/public/search?q=
GET /api/public/pages/:pageKey
```

## 16.2 Authenticated API

```text
POST /api/auth/session
POST /api/watchlist
DELETE /api/watchlist/:id
POST /api/discussions/threads
POST /api/discussions/comments
POST /api/reports
POST /api/wiki/edit-intents
POST /api/wiki/review/:revisionId/approve
POST /api/wiki/review/:revisionId/reject
POST /api/wiki/revisions/:revisionId/rollback
```

## 16.3 Admin API

```text
GET /api/admin/modqueue
POST /api/admin/modqueue/:caseId/assign
POST /api/admin/users/:userId/suspend
POST /api/admin/pages/:pageId/protect
POST /api/admin/rules/abuse
GET /api/admin/metrics/content
```

### 원칙
- OpenAPI 스키마 자동 생성
- 모든 DTO는 타입 검증 필수
- breaking change는 ADR 또는 changelog 기록

---

## 17. 검색 설계

## 17.1 검색 인덱스

### `stock_pages`
- ticker
- names
- aliases
- sector
- industry
- page_quality_score
- last_reviewed_at
- last_updated_at

### `wiki_content`
- page_key
- title
- html_text
- headings
- citations_count
- reviewed_state

### `discussion_content`
- page_key
- thread_title
- comment_text
- score
- recency

## 17.2 인덱싱 파이프라인
- page edited
- review approved/rejected
- stock alias updated
- market data status changed
- discussion created

### 인덱싱 원칙
- public search는 reviewed content 우선
- pending revision은 검수자 전용 인덱스 또는 별도 필터로 처리
- ticker exact match는 최고 우선순위

---

## 18. 모더레이션과 신뢰도 설계

## 18.1 다층 방어 구조

### Layer 1: 가입/인증
- 이메일 검증
- 기본 rate limit
- CAPTCHA
- 신규 계정 제한

### Layer 2: 작성 전 검사
- 금칙어
- 링크 수 제한
- pump phrase 탐지
- 출처 없음 경고
- 고위험 페이지 추가 경고

### Layer 3: MediaWiki 규칙
- AbuseFilter
- FlaggedRevs
- PageTriage
- 필요 시 Moderation extension

### Layer 4: 앱 큐
- pending edit review
- report handling
- user sanctions
- page protection

### Layer 5: 사후 대응
- revert
- lock
- shadowban / suspend / ban
- legal hold

## 18.2 페이지 보호 수준

- `open`: 일반 contributor 편집 가능, 검수 필요
- `semi_protected`: trusted contributor 이상만 편집
- `reviewer_only`: reviewer 이상만 직접 편집
- `locked`: admin/moderator만 편집

## 18.3 고위험 종목 정책

다음 신호가 발생하면 자동 보호 정책을 고려한다.

- 급등락
- 거래정지/관리종목 지정
- 소문성 뉴스 급증
- 동일 페이지 대량 신고
- 신규 계정 집중 유입

---

## 19. 데이터 연동 정책

## 19.1 외부 공급자 의존 원칙

V1에서는 실제 공급자보다 **공급자 추상화**가 우선이다.

```ts
interface MarketDataProvider {
  getQuote(key: StockKey): Promise<Quote>
  getCompanyProfile(key: StockKey): Promise<CompanyProfile>
  getRecentFilings(key: StockKey): Promise<Filing[]>
  getCorporateActions(key: StockKey): Promise<CorporateAction[]>
}
```

```ts
interface NewsProvider {
  getRecentNews(key: StockKey): Promise<NewsItem[]>
}
```

### 구현체
- `FixtureMarketDataProvider`
- `FixtureNewsProvider`
- `LiveMarketDataProvider` (후순위)

## 19.2 데이터 공급 우선순위
- 가격/시총/거래량: 실시간 또는 지연 시세 공급자
- 회사 프로필/종목 마스터: 정식 reference dataset
- 공시: 거래소/공시 시스템
- 뉴스: 라이선스 가능한 공급자

### V1 제한
- 라이선스 확정 전까지 뉴스 전문 저장 금지
- 제목/링크/메타데이터 수준 또는 자체 요약 저장 정책을 법무 검토 후 결정

---

## 20. 비기능 요구사항

## 20.1 성능
- 공개 종목 페이지 캐시 히트 시 p95 < 400ms
- 검색 자동완성 p95 < 200ms
- 토론 목록 p95 < 300ms
- 편집 저장 후 pending 상태 반영 < 3s
- 승인 후 공개 반영 < 10s

## 20.2 가용성
- public read 우선
- 외부 데이터 공급자 장애 시에도 위키 읽기 가능
- MediaWiki 편집 장애 시 public page는 degrade read-only로 유지

## 20.3 보안
- CSRF 보호
- XSS sanitization
- HTML render allowlist
- 관리자 2FA 필수
- audit log 보존
- secrets 분리
- 권한 escalation 방지

## 20.4 접근성
- WCAG 2.2 AA 목표
- 키보드 탐색
- 스크린리더 기본 대응
- diff/상태 배지의 색상 외 의미 제공

## 20.5 SEO
- SSR 우선
- sitemap
- canonical tags
- reviewed page만 index
- low-quality / unreviewed pages noindex 옵션

---

## 21. 하네스 엔지니어링 규격

이 섹션은 이 문서를 **Claude Code에 넣고 실제로 구현할 때 가장 중요한 섹션**이다.

## 21.1 저장소 구조 규약

```text
repo/
  apps/
    web/
    api/
    workers/
    admin/                 # 필요 시 web 내 route group으로 흡수 가능
  services/
    wiki-bridge/
    market-ingest/
    search-indexer/
  packages/
    domain/
    ui/
    config/
    testkit/
    fixtures/
  infra/
    docker/
    compose/
    k8s/
    terraform/
  docs/
    prd/
    adr/
    runbooks/
    evals/
  scripts/
    hooks/
    ci/
```

### 원칙
- 제품 코드와 infra 코드를 분리
- 공통 타입/스키마/fixture는 `packages/` 에 둔다
- `docs/` 는 에이전트가 항상 참조 가능한 지식 베이스 역할을 한다

## 21.2 반드시 생성해야 하는 파일

첫 세션에서 아래 파일을 만든다.

```text
CLAUDE.md
docs/prd/stockwiki-prd.md
docs/adr/0001-architecture.md
docs/runbooks/local-dev.md
docs/runbooks/moderation.md
docs/evals/core-flows.md
packages/fixtures/...
packages/testkit/...
.claude/settings.json
.claude/commands/
scripts/hooks/
```

## 21.3 `CLAUDE.md` 에 반드시 들어갈 내용

- 이 PRD 파일 경로
- 현재 단계(phase)
- 아키텍처 원칙
- 금지사항
- 테스트 실행 규칙
- 문서/ADR 갱신 규칙
- “한 번에 한 슬라이스” 규칙
- 외부 API 대신 fixture 우선 규칙
- MediaWiki DB direct access 금지 규칙

### 필수 문장 예시(개념)
- 이 저장소의 소스 오브 트루스는 `docs/prd/stockwiki-prd.md` 이다.
- PRD에 없는 큰 구조 변경은 ADR 없이 하지 않는다.
- 변경 후 최소한 changed-package scope의 lint/test/typecheck를 실행한다.
- 외부 연동이 막히면 인터페이스와 fake 구현으로 진행한다.
- 항상 테스트를 먼저 보강하거나 최소 동시에 작성한다.

## 21.4 Hooks 설계 원칙

Claude Code 공식 훅은 “반드시 실행돼야 하는 행위”를 보장하는 용도로 쓴다.

### 필요한 hook 동작
1. 파일 편집 후 관련 package의 formatter/linter 실행
2. `docs/prd/` 또는 `docs/adr/` 변경 시 markdown lint
3. `schema` / `api` / `dto` 변경 시 OpenAPI 또는 타입 생성 검증
4. migration 디렉터리 변경 시 특별 경고
5. `.env`, secrets, infra state 파일 편집 차단 또는 강한 확인
6. session start 시 현재 phase와 TODO 요약 주입

### 금지
- 훅에 네트워크 의존 작업 과다 탑재
- 훅에 느린 전체 테스트 매번 실행
- 훅으로 destructive command 자동 실행

## 21.5 Skills / Slash Commands 설계

프로젝트 전용 custom commands를 만든다.

### 권장 명령
- `/phase-plan` : 현재 phase 범위를 요약하고 작업 순서를 제안
- `/ship-slice` : 하나의 수직 슬라이스를 구현
- `/write-adr` : 설계 변경 시 ADR 작성
- `/review-diff` : 현재 변경사항 리뷰 + 리스크 점검
- `/stabilize` : flaky test, type errors, lint issues 정리
- `/prepare-release` : changelog, migration notes, rollout checklist 생성

## 21.6 세션 운영 규칙

Claude Code는 아래 순서로 움직인다.

1. PRD 읽기
2. 현재 phase 확인
3. 관련 ADR 확인
4. 필요한 fixture/test 확인
5. 수직 슬라이스 계획
6. 코드 작성
7. 테스트 실행
8. 문서 갱신
9. 다음 슬라이스 제안

### 세션당 금지
- 여러 phase 동시 진행
- 실제 외부 API 붙이기부터 시작
- 테스트 없는 대규모 리팩터
- 광범위한 infra 선구축

## 21.7 평가 하네스 원칙

### 평가 축
- 기능 정확성
- 회귀 안정성
- 정책 준수
- 성능 기본선
- 관측 가능성

### 반드시 있어야 하는 테스트 종류
1. unit tests
2. API integration tests
3. adapter contract tests
4. Playwright E2E tests
5. moderation eval tests
6. performance smoke tests

## 21.8 Fake 구현 우선 원칙

초기에는 반드시 아래 fake 구현을 만든다.

- `FakeWikiEngine`
- `FixtureMarketDataProvider`
- `FixtureNewsProvider`
- `FakeNotificationSender`

이렇게 해야 Claude Code가 외부 시스템 설정에 막히지 않고 제품 플로우를 먼저 완성할 수 있다.

---

## 22. 테스트 하네스 상세

## 22.1 핵심 E2E 시나리오

### Scenario 1 — 공개 종목 페이지 읽기
- 사용자가 `/stocks/krx/000001-han-river-robotics` 방문
- 시스템 데이터 카드, 위키 본문, 관련 토론 미리보기를 본다
- 페이지는 reviewed revision 기준으로 렌더된다

### Scenario 2 — Contributor가 편집 제안
- 로그인
- 편집 진입
- 사업 구조 섹션 수정
- 출처 추가
- edit summary 입력
- 저장
- pending revision 생성 확인
- public page는 아직 이전 approved revision 유지

### Scenario 3 — Reviewer가 승인
- mod queue 진입
- diff 확인
- 출처 확인
- approve
- public revision 갱신 확인
- search index 업데이트 확인

### Scenario 4 — 악성 편집 차단
- 신규 사용자
- 소형주 페이지에 선동 문구 입력
- 시스템이 queue 또는 reject
- public page unchanged
- moderation case 생성

### Scenario 5 — 토론 생성/투표/신고
- 사용자가 토론 스레드 생성
- 다른 사용자가 도움됨 투표
- 부적절 댓글 신고
- moderator가 처리

### Scenario 6 — 검색
- ticker exact match
- company name alias
- theme page 검색
- reviewed content 우선 노출 확인

### Scenario 7 — watchlist 알림
- 사용자가 종목 구독
- page approved revision 변경
- 인앱 알림 생성 확인

### Scenario 8 — page protection
- moderator가 페이지 semi_protect
- contributor 편집 차단
- trusted contributor 편집 허용 확인

## 22.2 계약 테스트(contract tests)

### WikiEngine contract
모든 구현체는 동일 테스트 세트를 통과해야 한다.
- create/update
- history
- diff
- rollback
- protect
- get reviewed content

### MarketDataProvider contract
- quote
- company profile
- filings
- corporate actions
- error fallback

## 22.3 moderation eval dataset

`packages/fixtures/moderation/` 에 다음 유형의 샘플을 둔다.
- 정상 factual edit
- citation missing edit
- promotional slang edit
- defamatory person claim
- spam link drop
- repetitive vandalism
- ambiguous edge case

각 샘플은 기대 결과를 가진다.
- allow
- queue
- reject
- escalate

## 22.4 성능 smoke tests
- home page
- stock page
- search autocomplete
- discussion list
- approve workflow

---

## 23. 개발 단계(Phases)

## Phase 0 — 저장소 부트스트랩

### 목표
실제 기능 개발 전, 에이전트가 안정적으로 작업할 수 있는 기본 하네스를 만든다.

### 범위
- monorepo skeleton
- package manager/workspace 설정
- `CLAUDE.md`
- docs 구조
- basic lint/typecheck/test
- Docker Compose 기본 서비스(Postgres, Redis, OpenSearch, MediaWiki placeholder)
- fixture package
- testkit package
- CI skeleton

### 종료 조건
- `pnpm lint`, `pnpm test`, `pnpm typecheck` 통과
- docs/runbooks/local-dev.md 존재
- FakeWikiEngine 테스트 scaffold 존재
- 첫 ADR 작성 완료

## Phase 1 — 읽기 전용 Stock Page MVP

### 목표
실제 사용자에게 보여줄 수 있는 읽기 전용 종목 페이지를 만든다.

### 범위
- stock master fixture
- market snapshot fixture
- public stock page route
- system data card
- wiki panel (FakeWikiEngine)
- discussion preview placeholder
- SEO metadata
- search box placeholder

### 종료 조건
- stock page SSR 렌더 성공
- Playwright로 public read scenario 통과
- canonical URL 동작
- noindex 조건 분기 존재

## Phase 2 — 위키 브리지와 리비전 모델

### 목표
가짜 위키 엔진에서 실제 WikiEngine 추상화로 전환 가능한 구조를 완성한다.

### 범위
- WikiEngine interface 확정
- FakeWikiEngine fully working
- revision/history/diff model
- approval state model
- app shadow tables
- MediaWikiEngine skeleton
- recent changes sync job skeleton

### 종료 조건
- FakeWikiEngine contract tests 통과
- history/diff UI 기본 동작
- approved/pending 상태 분기 동작

## Phase 3 — 편집 제안 플로우

### 목표
Contributor가 문서를 수정 제안하고 reviewer가 검토할 수 있게 한다.

### 범위
- 로그인
- contributor role gating
- edit intent flow
- edit summary
- save pending revision
- mod queue basic
- reviewer approve/reject

### 종료 조건
- edit -> pending -> approve full flow E2E 통과
- public revision gating 확인
- reputation event 발생

## Phase 4 — 출처/신뢰 정책

### 목표
위키가 단순 편집기가 아니라 검증 가능한 문서가 되게 만든다.

### 범위
- citation helper UI
- source tiering
- source presence checks
- outdated source warnings
- report reason: no citation
- moderation rule hooks

### 종료 조건
- citation-required sections 표시
- source-less contentious edit queue 처리
- dead-link scan job skeleton

## Phase 5 — 토론 시스템

### 목표
정본 문서와 분리된 토론 레이어를 제공한다.

### 범위
- thread list/create
- comment/reply
- helpful vote
- report comment
- pin/lock
- section-anchor linking

### 종료 조건
- discussion page usable
- moderation on discussion works
- article page에서 discussion summary 보임

## Phase 6 — 검색

### 목표
사용자가 티커, 종목명, 별칭, 문서 제목으로 빠르게 찾을 수 있게 한다.

### 범위
- OpenSearch setup
- indexing pipeline
- autocomplete
- result ranking
- alias support
- reviewed-content-first ranking

### 종료 조건
- exact ticker search passes
- alias search passes
- indexing lag metric 노출

## Phase 7 — watchlist / notifications

### 목표
사용자가 관심 페이지를 계속 추적하게 만든다.

### 범위
- watchlist add/remove
- notification center
- digest email stub
- approved revision notify
- discussion reply notify

### 종료 조건
- watchlist flow E2E 통과
- in-app notifications 보임

## Phase 8 — 실제 MediaWiki 통합

### 목표
FakeWikiEngine과 동일 계약으로 실제 MediaWiki 연동을 붙인다.

### 범위
- MediaWiki docker env
- OIDC/SSO wiring
- page title mapping
- get/render/history/diff integration
- edit integration
- recent changes poller
- extension wiring

### 종료 조건
- MediaWikiEngine contract tests 통과
- public read remains stable
- edit/approve flow works with real MediaWiki

## Phase 9 — 운영 도구와 하드닝

### 목표
실서비스 운영 가능한 기본 안전장치를 완성한다.

### 범위
- rate limits
- abuse rule dashboard
- page protection UI
- user sanctions
- audit logs
- stale page report
- observability dashboards
- incident runbook

### 종료 조건
- moderation backlog dashboard 존재
- page lock / revert / suspend works
- structured logs + Sentry + metrics 연결

## Phase 10 — 외부 데이터 연동

### 목표
픽스처를 실제 공급자 연동으로 치환한다.

### 범위
- live market provider
- filing ingest
- optional news provider
- retry/backoff
- fallback cache
- outage handling

### 종료 조건
- provider outages degrade gracefully
- data freshness metrics 노출
- app still works in read mode when provider fails

---

## 24. 각 Phase의 정의된 완료 기준(Definition of Done)

각 phase는 아래를 모두 만족해야 완료다.

- 요구사항 구현
- unit/integration/E2E 해당 범위 통과
- local dev command 문서화
- 필요한 fixture 추가
- ADR 또는 PRD note 반영
- known limitations 기록
- observability 최소 지표 추가
- 접근성 기본 점검
- 에러 상태 UI 확인

---

## 25. 운영/배포 전략

## 25.1 환경
- local
- preview
- staging
- production

## 25.2 배포 원칙
- web/api/workers 독립 배포
- MediaWiki는 별도 서비스로 운영
- DB migration은 app release와 명시적 순서 보장
- feature flags로 편집/토론/watchlist 단계적 공개

## 25.3 백업/복구
- Postgres 정기 백업
- MediaWiki 데이터/DB 백업
- OpenSearch 재색인 가능 구조
- object storage versioning
- rollback runbook 명시

---

## 26. 보안, 법무, 정책 고려사항

## 26.1 금융 관련 표현 정책
- 정본 문서에서 투자 권유성 문구 금지
- 루머성 표현 억제
- 인물/기업 비방성 문구 엄격 제한
- 최신 사건은 출처 없으면 숨김 또는 queue

## 26.2 저작권 정책
- 자유 업로드 이미지 V1 금지 또는 관리자 제한
- 외부 기사 전문 저장 금지
- 인용 범위 최소화
- 출처 표기 강제

## 26.3 이용약관/콘텐츠 라이선스
권장:
- 서비스 이용약관 + 커뮤니티 규칙 + 콘텐츠 라이선스 분리
- 문서 기여분은 플랫폼 내 재사용 가능 라이선스 필요
- 공개 위키 성격상 CC BY-SA 4.0 계열 검토 권장
- 최종 법률 검토 전까지 placeholder로 남겨도 됨

---

## 27. 명시적 설계 결정

### 채택
- MediaWiki hybrid
- custom read UX
- custom discussion system
- reviewed revision default
- structured market data as system-owned
- reputation-gated privileges
- Fake implementations first
- hooks + tests + docs as harness

### 명시적으로 하지 않음
- MediaWiki 스킨 커스터마이징 중심 개발
- MediaWiki DB direct reads
- 처음부터 live provider 의존
- Reddit식 인기 투표를 문서 진실 판정에 사용
- 익명 무제한 편집
- 자유 이미지 업로드 개방

---

## 28. 초기 시드 데이터 요구사항

### stock fixtures
최소 20개 synthetic ticker
- KRX / KOSDAQ / NASDAQ 혼합
- 섹터 다양성
- 상태 다양성(정상/거래정지/테마주 등)

### wiki fixtures
- 잘 작성된 페이지 5개
- citation 부족 페이지 3개
- pending revision 있는 페이지 3개
- high-risk locked page 2개

### discussion fixtures
- 정상 토론
- 의견 충돌
- 신고 대상 댓글
- 해결된 스레드

### moderation fixtures
- allow
- queue
- reject
- escalate

---

## 29. Claude Code 실행 프롬프트 템플릿

아래 템플릿은 사용자가 Claude Code 세션을 시작할 때 그대로 참고할 수 있다.

### Prompt A — 부트스트랩
```text
docs/prd/stockwiki-prd.md 를 읽고 이 문서를 소스 오브 트루스로 사용해.
Phase 0만 수행해.
먼저 해야 할 작업을 짧게 계획하고,
그 다음 저장소 skeleton, CLAUDE.md, docs/adr/0001-architecture.md, docs/runbooks/local-dev.md, packages/testkit, packages/fixtures, 기본 lint/test/typecheck, docker compose 초안을 만들어.
실제 기능 구현은 하지 말고 하네스를 먼저 완성해.
모든 변경 후 실행 명령과 현재 남은 리스크를 정리해.
```

### Prompt B — 읽기 전용 MVP
```text
Phase 1만 수행해.
FakeWikiEngine과 fixture market data를 사용해서 공개 종목 페이지를 구현해.
필수 요구사항은 system data card, wiki panel, canonical route, SEO metadata, basic Playwright test다.
외부 API 연동은 금지한다.
테스트와 문서를 같이 갱신해.
```

### Prompt C — 편집/검수
```text
Phase 3만 수행해.
로그인된 Contributor가 편집 제안을 만들고 Reviewer가 승인/거절할 수 있는 end-to-end flow를 구현해.
public page는 approved revision만 보여야 한다.
FakeWikiEngine 기준으로 먼저 완성하고, contract tests를 추가해.
```

### Prompt D — MediaWiki 연결
```text
Phase 8만 수행해.
기존 WikiEngine contract를 유지한 채 MediaWikiEngine을 구현해.
MediaWiki DB direct access는 금지한다.
공식 API/브리지로만 붙이고, 기존 FakeWikiEngine tests를 동일하게 통과시켜.
막히는 부분은 ADR로 기록하고 우회 가능한 최소 구현으로 끝내.
```

---

## 30. 최종 권장안 요약

### 제품적으로
- **정본 문서 + 토론 분리**
- **출처 중심 위키**
- **검수 기반 공개 반영**
- **주식 데이터는 시스템 관리, 서술은 커뮤니티 관리**

### 기술적으로
- **MediaWiki + Next.js + NestJS + Postgres + Redis + OpenSearch + Temporal**
- 외부 공급자는 인터페이스 뒤로 격리
- 초기에는 fake 구현으로 제품 플로우 먼저 완성

### 운영적으로
- **신규 사용자 제한 + 큐 + 자동 규칙 + 롤백 + 보호**
- 한국어권 공개형 서비스 특성상 반달/선동/명예훼손 대응을 제품 코어로 취급

### Claude Code 관점에서
- 이 문서는 “좋은 설명문”이 아니라 **구현 순서와 검증 기준이 있는 작업 지시서**다
- 성공 확률을 높이려면:
  - PRD를 잘게 쪼갠 phase 단위 실행
  - CLAUDE.md 유지
  - hooks로 반복 규칙 자동화
  - fixture와 contract tests로 외부 의존 축소
  - ADR로 설계 드리프트 방지
가 필수다

---

## 31. 참고 자료 / Research Appendix

아래 자료는 이 PRD의 설계 근거로 사용했다.

### 위키/커뮤니티 규모와 운영 패턴
- [R1] Wikimedia Foundation, “Wikipedia year in review 2025”  
  https://wikimediafoundation.org/wikipedia-year-in-review-2025/
- [R2] Pew Research Center, “What the data says about Wikipedia on its 25th anniversary”  
  https://www.pewresearch.org/short-reads/2026/01/13/wikipedia-at-25-what-the-data-tells-us/
- [R3] Reddit Investor Relations, company overview / Q4 & FY2025 results  
  https://investor.redditinc.com/overview/default.aspx  
  https://investor.redditinc.com/news-events/news-releases/news-details/2026/Reddit-Reports-Fourth-Quarter-and-Full-Year-2025-Results-Announces-1-Billion-Share-Repurchase-Program/default.aspx
- [R4] Reddit Help, upvotes/downvotes, karma, moderation queue, automoderator, rules  
  https://support.reddithelp.com/hc/en-us/articles/7419626610708-What-are-upvotes-and-downvotes  
  https://support.reddithelp.com/hc/en-us/articles/204511829-What-is-karma  
  https://support.reddithelp.com/hc/en-us/articles/15484440494356-Moderation-Queue  
  https://support.reddithelp.com/hc/en-us/articles/15484574206484-Automoderator  
  https://support.reddithelp.com/hc/en-us/articles/15484500104212-Rules
- [R5] Fandom official company/about materials  
  https://about.fandom.com/news/fandom-continues-to-expand-its-leadership-team-as-global-business-grows
- [R6] Similarweb, namu.wiki traffic and Korea ranking  
  https://www.similarweb.com/website/namu.wiki/  
  https://www.similarweb.com/top-websites/korea-republic-of/  
  https://www.similarweb.com/blog/research/market-research/most-visited-websites/
- [R7] Stack Overflow Help, privileges / reputation model  
  https://stackoverflow.com/help/privileges

### MediaWiki 기능과 확장
- [R8] MediaWiki REST API / Action API / History / Diff  
  https://www.mediawiki.org/wiki/API:REST_API  
  https://www.mediawiki.org/wiki/API:Action_API  
  https://www.mediawiki.org/wiki/Help:History  
  https://www.mediawiki.org/wiki/Help:Diff
- [R9] MediaWiki extensions: VisualEditor, Cite, AbuseFilter, FlaggedRevs, PageTriage, Moderation  
  https://www.mediawiki.org/wiki/Extension:VisualEditor  
  https://www.mediawiki.org/wiki/Extension:Cite  
  https://www.mediawiki.org/wiki/Extension:AbuseFilter  
  https://www.mediawiki.org/wiki/Extension:FlaggedRevs  
  https://www.mediawiki.org/wiki/Extension:PageTriage  
  https://www.mediawiki.org/wiki/Extension:Moderation
- [R10] MediaWiki discussion tools and deprecation of Structured Discussions  
  https://www.mediawiki.org/wiki/Help:DiscussionTools  
  https://www.mediawiki.org/wiki/Extension:DiscussionTools  
  https://www.mediawiki.org/wiki/Structured_Discussions
- [R11] MediaWiki authentication extensions  
  https://www.mediawiki.org/wiki/Extension:PluggableAuth  
  https://www.mediawiki.org/wiki/Extension:OpenID_Connect  
  https://www.mediawiki.org/wiki/Extension:OAuth  
  https://www.mediawiki.org/wiki/Extension:OATHAuth

### 위키 출처 정책
- [R12] Wikipedia sourcing / verifiability  
  https://en.wikipedia.org/wiki/Wikipedia:Reliable_sources  
  https://en.wikipedia.org/wiki/Wikipedia:Verifiability  
  https://en.wikipedia.org/wiki/Wikipedia:Citing_sources
- [R13] Fandom templates / infoboxes / cite  
  https://community.fandom.com/wiki/Help:Infoboxes  
  https://community.fandom.com/wiki/Help:Templates  
  https://community.fandom.com/wiki/Help:Cite

### Claude Code / Harness Engineering
- [R14] Claude Code docs: overview, memory, hooks, skills, interactive mode, CLI, best practices, headless, scheduled tasks  
  https://code.claude.com/docs/en/overview  
  https://code.claude.com/docs/en/memory  
  https://code.claude.com/docs/en/hooks  
  https://code.claude.com/docs/en/hooks-guide  
  https://code.claude.com/docs/en/skills  
  https://code.claude.com/docs/en/interactive-mode  
  https://code.claude.com/docs/en/cli-reference  
  https://code.claude.com/docs/en/best-practices  
  https://code.claude.com/docs/en/headless  
  https://code.claude.com/docs/en/scheduled-tasks
- [R15] OpenAI, “Harness engineering: leveraging Codex in an agent-first world”  
  https://openai.com/index/harness-engineering/
- [R16] Martin Fowler, “Harness Engineering”  
  https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html

---