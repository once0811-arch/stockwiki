import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import type { StockKey } from "@stockwiki/domain";
import { getStockWikiSnapshot } from "../stock-page/get-stock-wiki-snapshot";
import { evaluateEditAccess, getFakeSession } from "./fake-session";

const marketDataProvider = new FixtureMarketDataProvider();

export async function getStockEditPageData(input: StockKey & { actor?: string }) {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const snapshot = await getStockWikiSnapshot({
    key,
    profile
  });
  const session = getFakeSession(input.actor);

  return {
    access: evaluateEditAccess(session, snapshot.page.protectionLevel),
    actor: input.actor,
    historyPath: snapshot.revisionSummary.historyPath,
    prefillContent: snapshot.approvedRevision.contentMarkdown,
    profile,
    session
  };
}

function normalizeStockKey(input: StockKey): StockKey {
  return {
    market: input.market.toUpperCase(),
    ticker: input.ticker.toUpperCase()
  };
}
