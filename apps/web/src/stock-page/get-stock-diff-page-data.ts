import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import type { StockKey } from "@stockwiki/domain";
import { getStockWikiSnapshot } from "./get-stock-wiki-snapshot";

const marketDataProvider = new FixtureMarketDataProvider();

export async function getStockDiffPageData(input: StockKey, comparison: string) {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const snapshot = await getStockWikiSnapshot({
    key,
    profile
  });
  const [fromRevisionId, toRevisionId] = comparison.split("...");

  if (!fromRevisionId || !toRevisionId) {
    throw new Error(`Invalid comparison path: ${comparison}`);
  }

  const fromRevision = snapshot.history.find((revision) => revision.id === fromRevisionId);
  const toRevision = snapshot.history.find((revision) => revision.id === toRevisionId);
  if (!fromRevision || !toRevision) {
    throw new Error(`Missing revision pair for ${comparison}`);
  }

  const diff =
    snapshot.latestDiff && snapshot.approvedRevision.id === fromRevisionId && snapshot.latestRevision.id === toRevisionId
      ? snapshot.latestDiff
      : {
          fromRevisionId,
          toRevisionId,
          changedLineCount: countChangedLines(fromRevision.contentMarkdown, toRevision.contentMarkdown),
          summary: `${countChangedLines(fromRevision.contentMarkdown, toRevision.contentMarkdown)} changed line(s)`
        };

  return {
    citationSections: snapshot.citationSections,
    diff,
    fromRevision,
    fromSources: snapshot.historySources.find((revision) => revision.revisionId === fromRevision.id),
    profile,
    toRevision,
    toSources: snapshot.historySources.find((revision) => revision.revisionId === toRevision.id)
  };
}

function normalizeStockKey(input: StockKey): StockKey {
  return {
    market: input.market.toUpperCase(),
    ticker: input.ticker.toUpperCase()
  };
}

function countChangedLines(from: string, to: string): number {
  const left = from.split("\n");
  const right = to.split("\n");
  const max = Math.max(left.length, right.length);
  let count = 0;

  for (let index = 0; index < max; index += 1) {
    if ((left[index] ?? "") !== (right[index] ?? "")) {
      count += 1;
    }
  }

  return count;
}
