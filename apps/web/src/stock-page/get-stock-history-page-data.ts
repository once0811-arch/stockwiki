import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import type { StockKey } from "@stockwiki/domain";
import { getStockWikiSnapshot } from "./get-stock-wiki-snapshot";

const marketDataProvider = new FixtureMarketDataProvider();

export async function getStockHistoryPageData(input: StockKey) {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const snapshot = await getStockWikiSnapshot({
    key,
    profile
  });

  return {
    approvedRevisionId: snapshot.revisionSummary.approvedRevisionId,
    citationSections: snapshot.citationSections,
    comparePath: snapshot.revisionSummary.latestDiffPath,
    history: snapshot.history.map((revision) => {
      const sourceData = snapshot.historySources.find((item) => item.revisionId === revision.id);

      return {
        ...revision,
        citationCount: sourceData?.policy.citationCount ?? 0,
        findingCount: sourceData?.policy.findings.length ?? 0,
        policyStatus: sourceData?.policy.status ?? "clear",
        reportReasons: sourceData?.policy.reportReasons ?? []
      };
    }),
    latestRevisionId: snapshot.revisionSummary.latestRevisionId,
    profile
  };
}

function normalizeStockKey(input: StockKey): StockKey {
  return {
    market: input.market.toUpperCase(),
    ticker: input.ticker.toUpperCase()
  };
}
