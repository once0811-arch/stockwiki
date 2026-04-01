import type { CitationRecord, CitationSectionPolicy } from "@stockwiki/domain";
import { defaultCitationSectionPolicies } from "../wiki-edit/source-policy";

export interface DiscussionPreviewItem {
  id: string;
  title: string;
  summary: string;
  replies: number;
}

export type StockPageState = "reviewed" | "stale" | "noindex";

interface StockRevisionSeed {
  authorId: string;
  changedSectionIds: string[];
  citations: CitationRecord[];
  contentMarkdown: string;
  summary: string;
}

export interface StockPageSeed {
  citationSections: CitationSectionPolicy[];
  discussionPreview: DiscussionPreviewItem[];
  indexable: boolean;
  pageState: StockPageState;
  pageStateLabel: string;
  pageStateSummary: string;
  revisions: StockRevisionSeed[];
}

const stockPageSeeds: Record<string, StockPageSeed> = {
  "KRX:005930": {
    citationSections: defaultCitationSectionPolicies,
    discussionPreview: [
      {
        id: "thread-earnings",
        title: "실적 업데이트 placeholder",
        summary: "Phase 1에서는 토론 시스템 대신 preview summary만 보여준다.",
        replies: 12
      },
      {
        id: "thread-memory",
        title: "메모리 사이클 관찰",
        summary: "위키 본문과 분리된 의견 공간이 이후 phase 에서 확장된다.",
        replies: 7
      }
    ],
    indexable: true,
    pageState: "reviewed",
    pageStateLabel: "Reviewed",
    pageStateSummary: "Approved wiki content and market snapshot are ready for public indexing.",
    revisions: [
      {
        authorId: "system",
        changedSectionIds: ["business-model", "financial-performance"],
        citations: [
          {
            id: "005930-approved-business-model",
            label: "Samsung Electronics 2025 annual report",
            publishedAt: "2026-01-31",
            sectionId: "business-model",
            sourceTier: "tier1",
            sourceUrl: "https://example.test/ir/samsung-annual-report-2025"
          },
          {
            id: "005930-approved-financials",
            label: "Samsung Electronics Q4 2025 earnings release",
            publishedAt: "2026-01-31",
            sectionId: "financial-performance",
            sourceTier: "tier1",
            sourceUrl: "https://example.test/filings/samsung-q4-2025"
          }
        ],
        summary: "phase 1 approved revision",
        contentMarkdown:
          "StockWiki Phase 1 fixture page.\nSamsung Electronics is used as the first read-only stock page slice."
      }
    ]
  },
  "KRX:000660": {
    citationSections: defaultCitationSectionPolicies,
    discussionPreview: [
      {
        id: "thread-hbm",
        title: "HBM 수요 tracking placeholder",
        summary: "Phase 1에서는 종목별 discussion preview 가 서로 다른 seed 를 가져야 한다.",
        replies: 9
      },
      {
        id: "thread-cycle",
        title: "메모리 사이클 리스크",
        summary: "멀티 종목 fixture 가 canonical route 와 SEO metadata 를 검증한다.",
        replies: 5
      }
    ],
    indexable: true,
    pageState: "stale",
    pageStateLabel: "Stale Snapshot",
    pageStateSummary: "Fixture market snapshot is delayed while the public read route remains available.",
    revisions: [
      {
        authorId: "system",
        changedSectionIds: ["financial-performance", "recent-events"],
        citations: [
          {
            id: "000660-approved-financials",
            label: "SK hynix Q4 2025 earnings release",
            publishedAt: "2026-02-06",
            sectionId: "financial-performance",
            sourceTier: "tier1",
            sourceUrl: "https://example.test/filings/sk-hynix-q4-2025"
          },
          {
            id: "000660-approved-events",
            label: "SK hynix IR presentation on HBM demand",
            publishedAt: "2026-02-12",
            sectionId: "recent-events",
            sourceTier: "tier1",
            sourceUrl: "https://example.test/ir/sk-hynix-hbm-update"
          }
        ],
        summary: "phase 2 approved revision",
        contentMarkdown:
          "StockWiki Phase 2 approved revision.\nSK hynix approved revision anchors the public page while a pending update waits in history."
      },
      {
        authorId: "contributor-1",
        changedSectionIds: ["recent-events"],
        citations: [
          {
            id: "000660-pending-events",
            label: "HBM demand commentary transcript",
            publishedAt: "2026-03-10",
            sectionId: "recent-events",
            sourceTier: "tier2",
            sourceUrl: "https://example.test/transcripts/sk-hynix-hbm-demand"
          }
        ],
        summary: "phase 2 pending revision",
        contentMarkdown:
          "StockWiki Phase 2 pending revision.\nSK hynix pending revision adds HBM demand commentary for reviewer review."
      }
    ]
  },
  "KRX:035420": {
    citationSections: defaultCitationSectionPolicies,
    discussionPreview: [
      {
        id: "thread-commerce",
        title: "커머스 마진 placeholder",
        summary: "검색 노출과 공개 읽기 노출은 같은 규칙이 아닐 수 있다.",
        replies: 4
      },
      {
        id: "thread-ads",
        title: "광고 사업 업데이트",
        summary: "Phase 1 noindex 분기는 real provider 없이 fixture 로 유지한다.",
        replies: 3
      }
    ],
    indexable: false,
    pageState: "noindex",
    pageStateLabel: "Noindex",
    pageStateSummary: "Editorial review pending keeps this public route visible but excluded from indexing.",
    revisions: [
      {
        authorId: "system",
        changedSectionIds: ["business-model", "recent-events"],
        citations: [
          {
            id: "035420-approved-business-model",
            label: "NAVER 2025 annual report",
            publishedAt: "2026-02-07",
            sectionId: "business-model",
            sourceTier: "tier1",
            sourceUrl: "https://example.test/ir/naver-annual-report-2025"
          },
          {
            id: "035420-approved-events",
            label: "NAVER strategy update briefing",
            publishedAt: "2026-02-20",
            sectionId: "recent-events",
            sourceTier: "tier2",
            sourceUrl: "https://example.test/news/naver-strategy-update"
          }
        ],
        summary: "phase 1 approved revision",
        contentMarkdown:
          "StockWiki Phase 1 noindex fixture page.\nNAVER is used to keep a visible but non-indexable public route in the read-only slice."
      }
    ]
  }
};

export function getStockPageSeed(fixtureKey: string): StockPageSeed {
  const seed = stockPageSeeds[fixtureKey];
  if (!seed) {
    throw new Error(`Missing wiki seed for ${fixtureKey}`);
  }

  return seed;
}
