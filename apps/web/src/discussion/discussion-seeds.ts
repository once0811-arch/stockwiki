import type {
  DiscussionReportReason,
  DiscussionThreadRecord
} from "./types";

interface DiscussionCommentSeed {
  bodyMarkdown: string;
  createdAt: string;
  createdBy: string;
  helpfulVoterIds?: string[];
  id: string;
  parentCommentId?: string;
  reports?: Array<{
    createdAt: string;
    id: string;
    reason: DiscussionReportReason;
    reporterUserId: string;
    status?: "open" | "reviewed";
  }>;
}

interface DiscussionThreadSeed {
  comments: DiscussionCommentSeed[];
  createdAt: string;
  createdBy: string;
  id: string;
  pinned?: boolean;
  sectionAnchor?: string;
  status: DiscussionThreadRecord["status"];
  title: string;
  updatedAt: string;
}

export interface DiscussionSeedPage {
  pageKey: string;
  threads: DiscussionThreadSeed[];
}

export const discussionSeedPages: Record<string, DiscussionSeedPage> = {
  "stock:krx:005930": {
    pageKey: "stock:krx:005930",
    threads: [
      {
        id: "thread-seed-samsung-earnings",
        title: "실적 발표 해석 범위",
        status: "open",
        pinned: true,
        sectionAnchor: "financial-performance",
        createdBy: "member-1",
        createdAt: "2026-03-25T09:00:00.000Z",
        updatedAt: "2026-03-25T10:15:00.000Z",
        comments: [
          {
            id: "comment-seed-samsung-earnings-1",
            bodyMarkdown: "이번 분기 가이던스 문장은 숫자 중심으로만 요약하고, 해석은 토론으로 넘기는 편이 좋아 보여요.",
            createdAt: "2026-03-25T09:00:00.000Z",
            createdBy: "member-1",
            helpfulVoterIds: ["contributor-1"]
          },
          {
            id: "comment-seed-samsung-earnings-2",
            parentCommentId: "comment-seed-samsung-earnings-1",
            bodyMarkdown: "동의합니다. 정본에는 공시 숫자만 남기고 시장 해석은 discussion thread로 두죠.",
            createdAt: "2026-03-25T10:15:00.000Z",
            createdBy: "contributor-1",
            helpfulVoterIds: ["member-1", "reviewer-1"]
          }
        ]
      },
      {
        id: "thread-seed-samsung-structure",
        title: "사업 구조 문장 정리",
        status: "resolved",
        sectionAnchor: "business-model",
        createdBy: "contributor-1",
        createdAt: "2026-03-21T08:30:00.000Z",
        updatedAt: "2026-03-21T11:00:00.000Z",
        comments: [
          {
            id: "comment-seed-samsung-structure-1",
            bodyMarkdown: "반도체/모바일/가전 축만 남기고 세부 제품군은 위키 본문 링크로 보내는 쪽으로 정리 완료.",
            createdAt: "2026-03-21T11:00:00.000Z",
            createdBy: "reviewer-1",
            helpfulVoterIds: ["member-1"]
          }
        ]
      }
    ]
  },
  "stock:krx:000660": {
    pageKey: "stock:krx:000660",
    threads: [
      {
        id: "thread-seed-skhynix-hbm",
        title: "HBM 수요 전망 표현",
        status: "open",
        sectionAnchor: "recent-events",
        createdBy: "member-1",
        createdAt: "2026-03-28T06:20:00.000Z",
        updatedAt: "2026-03-28T08:05:00.000Z",
        comments: [
          {
            id: "comment-seed-skhynix-hbm-1",
            bodyMarkdown: "최근 인터뷰를 그대로 옮기기보다 transcript citation만 남기고 discussion에서 해석하는 편이 안전합니다.",
            createdAt: "2026-03-28T06:20:00.000Z",
            createdBy: "member-1",
            helpfulVoterIds: ["reviewer-1"]
          },
          {
            id: "comment-seed-skhynix-hbm-2",
            parentCommentId: "comment-seed-skhynix-hbm-1",
            bodyMarkdown: "그래도 현재 수요 톤은 본문 최근 이벤트 문단에 짧게 남겨야 독자가 맥락을 잡을 수 있어요.",
            createdAt: "2026-03-28T07:00:00.000Z",
            createdBy: "contributor-1",
            helpfulVoterIds: ["member-1"]
          },
          {
            id: "comment-seed-skhynix-hbm-3",
            parentCommentId: "comment-seed-skhynix-hbm-2",
            bodyMarkdown: "본문에는 공시/IR 사실만 남기고, 톤 해석은 이 thread에서 이어가자는 방향으로 reviewer 확인을 받읍시다.",
            createdAt: "2026-03-28T08:05:00.000Z",
            createdBy: "reviewer-1",
            helpfulVoterIds: ["member-1", "contributor-1"]
          }
        ]
      },
      {
        id: "thread-seed-skhynix-cycle",
        title: "메모리 사이클 숫자 기준",
        status: "open",
        sectionAnchor: "financial-performance",
        createdBy: "contributor-1",
        createdAt: "2026-03-22T04:10:00.000Z",
        updatedAt: "2026-03-22T05:40:00.000Z",
        comments: [
          {
            id: "comment-seed-skhynix-cycle-1",
            bodyMarkdown: "Cycle 문단은 valuation 숫자보다 재고/ASP 추세 쪽을 먼저 링크하는 게 더 읽기 좋겠습니다.",
            createdAt: "2026-03-22T05:40:00.000Z",
            createdBy: "contributor-1",
            helpfulVoterIds: ["member-1"]
          }
        ]
      }
    ]
  },
  "stock:krx:035420": {
    pageKey: "stock:krx:035420",
    threads: [
      {
        id: "thread-seed-naver-ads",
        title: "광고 사업 코멘트 검토",
        status: "open",
        sectionAnchor: "recent-events",
        createdBy: "member-1",
        createdAt: "2026-03-29T03:00:00.000Z",
        updatedAt: "2026-03-29T04:20:00.000Z",
        comments: [
          {
            id: "comment-seed-naver-ads-1",
            bodyMarkdown: "광고 사업 업데이트는 본문보다 discussion에서 표현 수위를 먼저 맞추는 게 좋아 보입니다.",
            createdAt: "2026-03-29T03:00:00.000Z",
            createdBy: "member-1",
            helpfulVoterIds: ["contributor-1"]
          },
          {
            id: "comment-seed-naver-ads-2",
            bodyMarkdown: "근거 없이 과장된 표현을 쓰면 안 됩니다. 사실관계 citation 없이 전망을 단정하지 맙시다.",
            createdAt: "2026-03-29T04:20:00.000Z",
            createdBy: "reviewer-1",
            reports: [
              {
                id: "report-seed-naver-ads-1",
                createdAt: "2026-03-29T04:40:00.000Z",
                reporterUserId: "member-1",
                reason: "misinformation"
              }
            ]
          }
        ]
      }
    ]
  }
};
