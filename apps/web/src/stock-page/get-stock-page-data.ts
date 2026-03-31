import type { CorporateAction, Filing, Quote, RenderedPage, StockKey } from "@stockwiki/domain";
import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import { FakeWikiEngine } from "@stockwiki/wiki-bridge";

interface DiscussionPreviewItem {
  id: string;
  title: string;
  summary: string;
  replies: number;
}

type StockPageState = "reviewed" | "stale" | "noindex";

export interface StockPageData {
  canonicalPath: string;
  corporateActions: CorporateAction[];
  discussionPreview: DiscussionPreviewItem[];
  filings: Filing[];
  indexable: boolean;
  pageState: StockPageState;
  pageStateLabel: string;
  pageStateSummary: string;
  profile: Awaited<ReturnType<FixtureMarketDataProvider["getCompanyProfile"]>>;
  quote: Quote;
  searchPlaceholder: string;
  wiki: RenderedPage;
}

const marketDataProvider = new FixtureMarketDataProvider();

interface StockPageSeed {
  contentMarkdown: string;
  discussionPreview: DiscussionPreviewItem[];
  indexable: boolean;
  pageState: StockPageState;
  pageStateLabel: string;
  pageStateSummary: string;
}

const wikiSeeds: Record<string, StockPageSeed> = {
  "KRX:005930": {
    contentMarkdown:
      "StockWiki Phase 1 fixture page.\nSamsung Electronics is used as the first read-only stock page slice.",
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
    pageStateSummary: "Approved wiki content and market snapshot are ready for public indexing."
  },
  "KRX:000660": {
    contentMarkdown:
      "StockWiki Phase 1 second fixture page.\nSK hynix is used to verify multiple public stock routes in the read-only slice.",
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
    pageStateSummary: "Fixture market snapshot is delayed while the public read route remains available."
  },
  "KRX:035420": {
    contentMarkdown:
      "StockWiki Phase 1 noindex fixture page.\nNAVER is used to keep a visible but non-indexable public route in the read-only slice.",
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
    pageStateSummary: "Editorial review pending keeps this public route visible but excluded from indexing."
  }
};

export async function getStockPageData(input: StockKey): Promise<StockPageData> {
  const key = normalizeStockKey(input);
  const fixtureKey = toFixtureKey(key);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const quote = await marketDataProvider.getQuote(key);
  const filings = await marketDataProvider.getRecentFilings(key);
  const corporateActions = await marketDataProvider.getCorporateActions(key);
  const wikiSeed = wikiSeeds[fixtureKey];

  if (!wikiSeed) {
    throw new Error(`Missing wiki seed for ${fixtureKey}`);
  }

  const wikiEngine = new FakeWikiEngine();
  await wikiEngine.createOrUpdatePage({
    key: profile.canonicalPageKey,
    title: profile.name,
    summary: "Approved bootstrap content",
    contentMarkdown: wikiSeed.contentMarkdown,
    authorId: "system"
  });

  const wiki = await wikiEngine.getRenderedHtml(profile.canonicalPageKey);

  return {
    canonicalPath: `/stocks/${key.market.toLowerCase()}/${key.ticker}`,
    corporateActions,
    discussionPreview: wikiSeed.discussionPreview,
    filings,
    indexable: wikiSeed.indexable && wiki.reviewed,
    pageState: wikiSeed.pageState,
    pageStateLabel: wikiSeed.pageStateLabel,
    pageStateSummary: wikiSeed.pageStateSummary,
    profile,
    quote,
    searchPlaceholder: "Search placeholder for aliases, filings, and related pages",
    wiki
  };
}

function normalizeStockKey(input: StockKey): StockKey {
  return {
    market: input.market.toUpperCase(),
    ticker: input.ticker.toUpperCase()
  };
}

function toFixtureKey(input: StockKey): string {
  return `${input.market}:${input.ticker}`;
}
