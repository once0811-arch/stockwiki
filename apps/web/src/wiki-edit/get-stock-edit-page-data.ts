import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import type { StockKey } from "@stockwiki/domain";
import { getStockWikiSnapshot } from "../stock-page/get-stock-wiki-snapshot";
import { evaluateEditAccess, getFakeSession } from "./fake-session";
import { getSourceTierGuidance } from "./source-policy";

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
    citationSections: snapshot.citationSections,
    historyPath: snapshot.revisionSummary.historyPath,
    prefillContent: snapshot.approvedRevision.contentMarkdown,
    profile,
    session,
    sourceTierGuidance: getSourceTierGuidance()
  };
}

function normalizeStockKey(input: StockKey): StockKey {
  return {
    market: input.market.toUpperCase(),
    ticker: input.ticker.toUpperCase()
  };
}
