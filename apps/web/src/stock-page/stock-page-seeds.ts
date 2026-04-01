import type { CitationRecord, CitationSectionPolicy } from "@stockwiki/domain";
import { defaultCitationSectionPolicies } from "../wiki-edit/source-policy";

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
  indexable: boolean;
  pageState: StockPageState;
  pageStateLabel: string;
  pageStateSummary: string;
  revisions: StockRevisionSeed[];
}

const stockPageSeeds: Record<string, StockPageSeed> = {
  "KRX:005930": {
    citationSections: defaultCitationSectionPolicies,
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
