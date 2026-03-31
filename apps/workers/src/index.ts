import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import { FakeWikiEngine } from "@stockwiki/wiki-bridge";

async function main(): Promise<void> {
  const marketDataProvider = new FixtureMarketDataProvider();
  const wikiEngine = new FakeWikiEngine();
  const quote = await marketDataProvider.getQuote({
    market: "KRX",
    ticker: "005930"
  });
  const recentChanges = await wikiEngine.getRecentChanges();

  console.log("StockWiki worker bootstrap", {
    phase: 0,
    sampleTicker: quote.ticker,
    recentChanges: recentChanges.items.length
  });
}

void main();
