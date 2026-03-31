import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import { FakeWikiEngine } from "@stockwiki/wiki-bridge";
import { InMemoryWikiShadowStore } from "@stockwiki/wiki-bridge/shadow-store";
import { syncRecentChangesToShadowStore } from "./wiki-recent-changes-sync.js";

async function main(): Promise<void> {
  const marketDataProvider = new FixtureMarketDataProvider();
  const wikiEngine = new FakeWikiEngine();
  const shadowStore = new InMemoryWikiShadowStore();
  await wikiEngine.createOrUpdatePage({
    key: "stock:krx:005930",
    title: "Samsung Electronics",
    summary: "worker approved seed",
    contentMarkdown: "Approved worker seed revision",
    authorId: "system"
  });
  const quote = await marketDataProvider.getQuote({
    market: "KRX",
    ticker: "005930"
  });
  const syncResult = await syncRecentChangesToShadowStore({
    engine: wikiEngine,
    store: shadowStore
  });

  console.log("StockWiki worker bootstrap", {
    phase: 2,
    sampleTicker: quote.ticker,
    syncedPages: syncResult.pageCount,
    syncedRevisions: syncResult.revisionCount
  });
}

void main();
