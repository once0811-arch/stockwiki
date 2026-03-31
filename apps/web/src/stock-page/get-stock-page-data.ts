import type { CorporateAction, Filing, Quote, RenderedPage, StockKey } from "@stockwiki/domain";
import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import type { DiscussionPreviewItem, StockPageState } from "./stock-page-seeds";
import { getStockWikiSnapshot, type StockRevisionSummary } from "./get-stock-wiki-snapshot";

export interface StockPageData {
  canonicalPath: string;
  corporateActions: CorporateAction[];
  discussionPreview: DiscussionPreviewItem[];
  editPath: string;
  filings: Filing[];
  indexable: boolean;
  pageState: StockPageState;
  pageStateLabel: string;
  pageStateSummary: string;
  profile: Awaited<ReturnType<FixtureMarketDataProvider["getCompanyProfile"]>>;
  quote: Quote;
  revisionSummary: StockRevisionSummary;
  searchPlaceholder: string;
  wiki: RenderedPage;
}

const marketDataProvider = new FixtureMarketDataProvider();

export async function getStockPageData(input: StockKey, actor?: string): Promise<StockPageData> {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const quote = await marketDataProvider.getQuote(key);
  const filings = await marketDataProvider.getRecentFilings(key);
  const corporateActions = await marketDataProvider.getCorporateActions(key);
  const snapshot = await getStockWikiSnapshot({
    key,
    profile
  });

  return {
    canonicalPath: `/stocks/${key.market.toLowerCase()}/${key.ticker}`,
    corporateActions,
    discussionPreview: snapshot.seed.discussionPreview,
    editPath: buildEditPath(key, actor),
    filings,
    indexable: snapshot.seed.indexable && snapshot.wiki.reviewed,
    pageState: snapshot.seed.pageState,
    pageStateLabel: snapshot.seed.pageStateLabel,
    pageStateSummary: snapshot.seed.pageStateSummary,
    profile,
    quote,
    revisionSummary: snapshot.revisionSummary,
    searchPlaceholder: "Search placeholder for aliases, filings, and related pages",
    wiki: snapshot.wiki
  };
}

function buildEditPath(key: StockKey, actor?: string): string {
  const basePath = `/stocks/${key.market.toLowerCase()}/${key.ticker}/edit`;

  if (!actor) {
    return basePath;
  }

  return `${basePath}?actor=${encodeURIComponent(actor)}`;
}

function normalizeStockKey(input: StockKey): StockKey {
  return {
    market: input.market.toUpperCase(),
    ticker: input.ticker.toUpperCase()
  };
}
