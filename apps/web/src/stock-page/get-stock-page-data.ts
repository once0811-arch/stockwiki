import type {
  CitationSectionPolicy,
  CorporateAction,
  Filing,
  Quote,
  RenderedPage,
  SourceTierDefinition,
  StockKey
} from "@stockwiki/domain";
import { sourceTierDefinitions } from "@stockwiki/domain";
import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import {
  getStockDiscussionPreviewData,
  type DiscussionSummarySnapshot
} from "../discussion/discussion-read-model";
import type { DiscussionPreviewItem } from "../discussion/types";
import type { StockPageState } from "./stock-page-seeds";
import {
  getStockWikiSnapshot,
  type RevisionSourcesSnapshot,
  type StockRevisionSummary
} from "./get-stock-wiki-snapshot";

export interface StockPageData {
  approvedSources: RevisionSourcesSnapshot;
  canonicalPath: string;
  citationSections: CitationSectionPolicy[];
  corporateActions: CorporateAction[];
  discussionPath: string;
  discussionPreview: DiscussionPreviewItem[];
  discussionSummary: DiscussionSummarySnapshot;
  editPath: string;
  filings: Filing[];
  indexable: boolean;
  latestSources: RevisionSourcesSnapshot;
  pageState: StockPageState;
  pageStateLabel: string;
  pageStateSummary: string;
  profile: Awaited<ReturnType<FixtureMarketDataProvider["getCompanyProfile"]>>;
  quote: Quote;
  revisionSummary: StockRevisionSummary;
  searchPlaceholder: string;
  sourceTierGuidance: SourceTierDefinition[];
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
  const discussionData = await getStockDiscussionPreviewData(key, actor);

  return {
    approvedSources: snapshot.approvedSources,
    canonicalPath: `/stocks/${key.market.toLowerCase()}/${key.ticker}`,
    citationSections: snapshot.citationSections,
    corporateActions,
    discussionPath: discussionData.discussionPath,
    discussionPreview: discussionData.previewItems,
    discussionSummary: discussionData.summary,
    editPath: buildEditPath(key, actor),
    filings,
    indexable: snapshot.seed.indexable && snapshot.wiki.reviewed,
    latestSources: snapshot.latestSources,
    pageState: snapshot.seed.pageState,
    pageStateLabel: snapshot.seed.pageStateLabel,
    pageStateSummary: snapshot.seed.pageStateSummary,
    profile,
    quote,
    revisionSummary: snapshot.revisionSummary,
    searchPlaceholder: "Search placeholder for aliases, filings, and related pages",
    sourceTierGuidance: sourceTierDefinitions,
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
