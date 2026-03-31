import type {
  CompanyProfile,
  CorporateAction,
  Filing,
  MarketDataProvider,
  Quote,
  StockKey
} from "@stockwiki/domain";

const PHASE0_TICKER = "KRX:005930";

const quotes: Record<string, Quote> = {
  [PHASE0_TICKER]: {
    market: "KRX",
    ticker: "005930",
    currency: "KRW",
    price: 81200,
    change: 1500,
    changePct: 1.88,
    marketCap: 484800000000000
  }
};

const profiles: Record<string, CompanyProfile> = {
  [PHASE0_TICKER]: {
    market: "KRX",
    ticker: "005930",
    name: "Samsung Electronics",
    summary: "Phase 0 fixture profile for repository bootstrap only.",
    sector: "Information Technology",
    industry: "Semiconductors",
    canonicalPageKey: "stock:krx:005930"
  }
};

const filings: Record<string, Filing[]> = {
  [PHASE0_TICKER]: [
    {
      id: "filing-q4-2025",
      title: "Q4 2025 Earnings Release",
      filedAt: "2026-01-31T00:00:00.000Z",
      sourceUrl: "https://example.test/filings/q4-2025"
    }
  ]
};

const corporateActions: Record<string, CorporateAction[]> = {
  [PHASE0_TICKER]: [
    {
      id: "action-dividend-2025",
      actionType: "dividend",
      effectiveAt: "2026-02-28T00:00:00.000Z",
      summary: "Fixture dividend event used in Phase 0 tests."
    }
  ]
};

function makeKey(key: StockKey): string {
  return `${key.market.toUpperCase()}:${key.ticker.toUpperCase()}`;
}

export class FixtureMarketDataProvider implements MarketDataProvider {
  async getQuote(key: StockKey): Promise<Quote> {
    return readFixture(quotes, key, "quote");
  }

  async getCompanyProfile(key: StockKey): Promise<CompanyProfile> {
    return readFixture(profiles, key, "company profile");
  }

  async getRecentFilings(key: StockKey): Promise<Filing[]> {
    return readFixture(filings, key, "filings");
  }

  async getCorporateActions(key: StockKey): Promise<CorporateAction[]> {
    return readFixture(corporateActions, key, "corporate actions");
  }
}

function readFixture<T>(store: Record<string, T>, key: StockKey, label: string): T {
  const fixture = store[makeKey(key)];
  if (!fixture) {
    throw new Error(`Missing ${label} fixture for ${key.market}:${key.ticker}`);
  }
  return fixture;
}

export const phase0Fixtures = {
  quotes,
  profiles,
  filings,
  corporateActions
};
