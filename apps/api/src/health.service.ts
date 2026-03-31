import { Injectable } from "@nestjs/common";
import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import { FakeWikiEngine } from "@stockwiki/wiki-bridge";

@Injectable()
export class HealthService {
  private readonly marketDataProvider = new FixtureMarketDataProvider();
  private readonly wikiEngine = new FakeWikiEngine();

  async getHealth() {
    const quote = await this.marketDataProvider.getQuote({
      market: "KRX",
      ticker: "005930"
    });
    const changes = await this.wikiEngine.getRecentChanges();

    return {
      ok: true,
      phase: 0,
      service: "api",
      adapters: {
        wiki: "fake",
        marketData: "fixture"
      },
      sampleTicker: quote.ticker,
      recentChanges: changes.items.length
    };
  }
}
