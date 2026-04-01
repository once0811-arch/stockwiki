import type { SearchIndexSyncResult } from "@stockwiki/domain";
import { buildSearchIndexSyncResult } from "@stockwiki/domain";
import {
  phase0Fixtures,
  searchIndexEventFixtures,
  searchIndexFixtureCheckpoint
} from "@stockwiki/fixtures";
import { buildDiscussionPath } from "../discussion/discussion-read-model";
import { listDiscussionComments, listDiscussionThreads } from "../discussion/discussion-store";
import { getStockPageSeed, type StockPageState } from "../stock-page/stock-page-seeds";

export const searchPlaceholderText = "Search by ticker, company name, or alias";

export type SearchMatchKind = "alias" | "canonical_title" | "discussion_title" | "exact_ticker" | "title";
export type SearchResultGroupId = "discussions" | "stocks";

export interface SearchAutocompleteItem {
  canonicalPath: string;
  kind: "alias" | "ticker" | "title";
  label: string;
  value: string;
}

export interface SearchResultItem {
  aliases: string[];
  canonicalPath: string;
  group: SearchResultGroupId;
  id: string;
  matchKind: SearchMatchKind;
  matchLabel: string;
  matchedText: string;
  pageKey: string;
  pageState: StockPageState;
  pageStateLabel: string;
  summary: string;
  ticker?: string;
  title: string;
}

export interface SearchResultGroup {
  id: SearchResultGroupId;
  items: SearchResultItem[];
  label: string;
}

export interface SearchPageData {
  autocomplete: SearchAutocompleteItem[];
  emptyStateMessage: string;
  groups: SearchResultGroup[];
  indexSync: SearchIndexSyncResult;
  normalizedQuery: string;
  query: string;
  searchPlaceholder: string;
  totalResultCount: number;
}

interface StockSearchRecord {
  aliases: string[];
  canonicalPath: string;
  pageKey: string;
  pageState: StockPageState;
  pageStateLabel: string;
  searchable: boolean;
  summary: string;
  ticker: string;
  title: string;
}

interface RankedSearchResult extends SearchResultItem {
  score: number;
}

export function getSearchPageData(query?: string): SearchPageData {
  const normalizedQuery = normalizeText(query);
  const stockRecords = buildStockSearchRecords();
  const stockResults = normalizedQuery ? rankStockResults(stockRecords, normalizedQuery) : [];
  const discussionResults = normalizedQuery ? rankDiscussionResults(stockRecords, normalizedQuery) : [];
  const groups = buildGroups(stockResults, discussionResults);

  return {
    autocomplete: buildAutocompleteItems(stockRecords, normalizedQuery),
    emptyStateMessage: normalizedQuery
      ? "No reviewed stock pages or discussion threads matched this query yet."
      : "Search is ready for tickers, canonical titles, aliases, and discussion titles.",
    groups,
    indexSync: buildSearchIndexSyncResult({
      events: searchIndexEventFixtures,
      indexedThrough: searchIndexFixtureCheckpoint.indexedThrough
    }),
    normalizedQuery,
    query: query?.trim() ?? "",
    searchPlaceholder: searchPlaceholderText,
    totalResultCount: groups.reduce((count, group) => count + group.items.length, 0)
  };
}

function buildStockSearchRecords(): StockSearchRecord[] {
  return Object.values(phase0Fixtures.profiles).map((profile) => {
    const seed = getStockPageSeed(`${profile.market}:${profile.ticker}`);

    return {
      aliases: profile.aliases,
      canonicalPath: `/stocks/${profile.market.toLowerCase()}/${profile.ticker}`,
      pageKey: profile.canonicalPageKey,
      pageState: seed.pageState,
      pageStateLabel: seed.pageStateLabel,
      searchable: seed.indexable,
      summary: seed.pageStateSummary,
      ticker: profile.ticker,
      title: profile.name
    };
  });
}

function rankStockResults(records: StockSearchRecord[], normalizedQuery: string): SearchResultItem[] {
  return records
    .filter((record) => record.searchable)
    .map((record) => rankStockRecord(record, normalizedQuery))
    .filter((result): result is RankedSearchResult => Boolean(result))
    .sort(compareRankedResults)
    .map(stripScore);
}

function rankStockRecord(record: StockSearchRecord, normalizedQuery: string): RankedSearchResult | undefined {
  const exactTickerMatch = record.ticker.toLowerCase() === normalizedQuery;
  const canonicalTitleMatch = normalizeText(record.title) === normalizedQuery;
  const exactAliasMatch = record.aliases.find((alias) => normalizeText(alias) === normalizedQuery);
  const partialAliasMatch = record.aliases.find((alias) => normalizeText(alias).includes(normalizedQuery));
  const titleMatch = normalizeText(record.title).includes(normalizedQuery);

  if (!exactTickerMatch && !canonicalTitleMatch && !exactAliasMatch && !partialAliasMatch && !titleMatch) {
    return undefined;
  }

  if (exactTickerMatch) {
    return buildRankedStockResult(record, "exact_ticker", record.ticker, 500);
  }

  if (canonicalTitleMatch) {
    return buildRankedStockResult(record, "canonical_title", record.title, 400);
  }

  if (exactAliasMatch || partialAliasMatch) {
    return buildRankedStockResult(record, "alias", exactAliasMatch ?? partialAliasMatch ?? "", 320);
  }

  return buildRankedStockResult(record, "title", record.title, 260);
}

function buildRankedStockResult(
  record: StockSearchRecord,
  matchKind: SearchMatchKind,
  matchedText: string,
  score: number
): RankedSearchResult {
  return {
    aliases: record.aliases,
    canonicalPath: record.canonicalPath,
    group: "stocks",
    id: record.pageKey,
    matchKind,
    matchLabel: formatMatchLabel(matchKind),
    matchedText,
    pageKey: record.pageKey,
    pageState: record.pageState,
    pageStateLabel: record.pageStateLabel,
    score: score + pageStateBoost(record.pageState),
    summary: record.summary,
    ticker: record.ticker,
    title: record.title
  };
}

function rankDiscussionResults(records: StockSearchRecord[], normalizedQuery: string): SearchResultItem[] {
  const rankedResults: RankedSearchResult[] = [];

  for (const record of records.filter((item) => item.searchable)) {
    const key = {
      market: extractMarket(record.pageKey),
      ticker: record.ticker
    };

    for (const thread of listDiscussionThreads(record.pageKey)) {
      const latestComment = listDiscussionComments(thread.id).at(-1);
      const titleMatch = normalizeText(thread.title).includes(normalizedQuery);
      const commentMatch = normalizeText(latestComment?.bodyMarkdown ?? "").includes(normalizedQuery);

      if (!titleMatch && !commentMatch) {
        continue;
      }

      rankedResults.push({
        aliases: record.aliases,
        canonicalPath: `${buildDiscussionPath(key)}#${thread.id}`,
        group: "discussions",
        id: thread.id,
        matchKind: "discussion_title",
        matchLabel: formatMatchLabel("discussion_title"),
        matchedText: titleMatch ? thread.title : latestComment?.bodyMarkdown ?? thread.title,
        pageKey: record.pageKey,
        pageState: record.pageState,
        pageStateLabel: thread.status === "locked" ? "Locked Thread" : "Open Thread",
        score: titleMatch ? 120 : 90,
        summary: latestComment?.bodyMarkdown ?? "Discussion thread waiting for its first reply.",
        ticker: record.ticker,
        title: thread.title
      });
    }
  }

  return rankedResults
    .sort(compareRankedResults)
    .map(stripScore);
}

function buildGroups(stockResults: SearchResultItem[], discussionResults: SearchResultItem[]): SearchResultGroup[] {
  const groups: SearchResultGroup[] = [];

  if (stockResults.length > 0) {
    groups.push({
      id: "stocks",
      items: stockResults,
      label: "Stock Pages"
    });
  }

  if (discussionResults.length > 0) {
    groups.push({
      id: "discussions",
      items: discussionResults,
      label: "Discussion Threads"
    });
  }

  return groups;
}

function buildAutocompleteItems(records: StockSearchRecord[], normalizedQuery: string): SearchAutocompleteItem[] {
  const unique = new Set<string>();
  const suggestions: SearchAutocompleteItem[] = [];

  for (const record of records.filter((item) => item.searchable)) {
    const candidates: SearchAutocompleteItem[] = [
      {
        canonicalPath: record.canonicalPath,
        kind: "ticker",
        label: `${record.ticker} · ${record.title}`,
        value: record.ticker
      },
      {
        canonicalPath: record.canonicalPath,
        kind: "title",
        label: `${record.title} · canonical`,
        value: record.title
      },
      ...record.aliases.map((alias) => ({
        canonicalPath: record.canonicalPath,
        kind: "alias" as const,
        label: `${alias} · ${record.title}`,
        value: alias
      }))
    ];

    for (const candidate of candidates) {
      const normalizedValue = normalizeText(candidate.value);
      const shouldInclude = normalizedQuery.length === 0 ? suggestions.length < 6 : normalizedValue.startsWith(normalizedQuery);

      if (!shouldInclude || unique.has(`${candidate.kind}:${normalizedValue}`)) {
        continue;
      }

      unique.add(`${candidate.kind}:${normalizedValue}`);
      suggestions.push(candidate);
    }
  }

  return suggestions.slice(0, 6);
}

function compareRankedResults(left: RankedSearchResult, right: RankedSearchResult): number {
  if (left.group !== right.group) {
    return left.group === "stocks" ? -1 : 1;
  }

  if (left.score !== right.score) {
    return right.score - left.score;
  }

  return left.title.localeCompare(right.title);
}

function stripScore(input: RankedSearchResult): SearchResultItem {
  const { score, ...result } = input;
  void score;
  return result;
}

function pageStateBoost(pageState: StockPageState): number {
  switch (pageState) {
    case "reviewed":
      return 30;
    case "stale":
      return 10;
    default:
      return 0;
  }
}

function formatMatchLabel(matchKind: SearchMatchKind): string {
  switch (matchKind) {
    case "exact_ticker":
      return "Exact ticker";
    case "canonical_title":
      return "Canonical title";
    case "alias":
      return "Alias match";
    case "discussion_title":
      return "Discussion title";
    case "title":
      return "Title match";
  }
}

function extractMarket(pageKey: string): string {
  return pageKey.split(":")[1]?.toUpperCase() ?? "KRX";
}

function normalizeText(input?: string): string {
  return input?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}
