import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import { FakeWikiEngine } from "@stockwiki/wiki-bridge";
import { InMemoryWikiShadowStore } from "@stockwiki/wiki-bridge/shadow-store";
import { scanCitationLinks } from "./citation-dead-link-scan.js";
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
  const deadLinkScan = await scanCitationLinks({
    checkedAt: "2026-04-01T00:00:00.000Z",
    citations: [
      {
        id: "worker-citation",
        label: "Worker seed source",
        sectionId: "recent-events",
        sourceTier: "tier1",
        sourceUrl: "https://example.test/worker-seed"
      }
    ],
    probe: async () => ({
      ok: true,
      status: 200
    })
  });

  console.log("StockWiki worker bootstrap", {
    phase: 4,
    deadLinks: deadLinkScan.deadCount,
    linkChecks: deadLinkScan.checkedCount,
    sampleTicker: quote.ticker,
    syncedPages: syncResult.pageCount,
    syncedRevisions: syncResult.revisionCount
  });
}

void main();
