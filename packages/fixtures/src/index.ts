import type {
  CompanyProfile,
  CorporateAction,
  Filing,
  MarketDataProvider,
  Quote,
  StockKey
} from "@stockwiki/domain";

const SAMSUNG_ELECTRONICS = "KRX:005930";
const SK_HYNIX = "KRX:000660";
const NAVER = "KRX:035420";

const quotes: Record<string, Quote> = {
  [SAMSUNG_ELECTRONICS]: {
    market: "KRX",
    ticker: "005930",
    currency: "KRW",
    price: 81200,
    change: 1500,
    changePct: 1.88,
    marketCap: 484800000000000
  },
  [SK_HYNIX]: {
    market: "KRX",
    ticker: "000660",
    currency: "KRW",
    price: 198500,
    change: -4200,
    changePct: -2.07,
    marketCap: 144508081025000
  },
  [NAVER]: {
    market: "KRX",
    ticker: "035420",
    currency: "KRW",
    price: 224000,
    change: 2500,
    changePct: 1.13,
    marketCap: 35082840264000
  }
};

const profiles: Record<string, CompanyProfile> = {
  [SAMSUNG_ELECTRONICS]: {
    market: "KRX",
    ticker: "005930",
    name: "Samsung Electronics",
    summary: "Phase 0 fixture profile for repository bootstrap only.",
    sector: "Information Technology",
    industry: "Semiconductors",
    canonicalPageKey: "stock:krx:005930"
  },
  [SK_HYNIX]: {
    market: "KRX",
    ticker: "000660",
    name: "SK hynix",
    summary: "Memory and storage fixture used for the second Phase 1 stock route.",
    sector: "Information Technology",
    industry: "Semiconductors",
    canonicalPageKey: "stock:krx:000660"
  },
  [NAVER]: {
    market: "KRX",
    ticker: "035420",
    name: "NAVER",
    summary: "Consumer internet and commerce fixture used for the noindex Phase 1 branch.",
    sector: "Communication Services",
    industry: "Internet Services",
    canonicalPageKey: "stock:krx:035420"
  }
};

const filings: Record<string, Filing[]> = {
  [SAMSUNG_ELECTRONICS]: [
    {
      id: "filing-q4-2025",
      title: "Q4 2025 Earnings Release",
      filedAt: "2026-01-31T00:00:00.000Z",
      sourceUrl: "https://example.test/filings/q4-2025"
    }
  ],
  [SK_HYNIX]: [
    {
      id: "filing-q4-2025-sk-hynix",
      title: "Q4 2025 Earnings Release",
      filedAt: "2026-02-06T00:00:00.000Z",
      sourceUrl: "https://example.test/filings/sk-hynix-q4-2025"
    }
  ],
  [NAVER]: [
    {
      id: "filing-q4-2025-naver",
      title: "Q4 2025 Earnings Release",
      filedAt: "2026-02-07T00:00:00.000Z",
      sourceUrl: "https://example.test/filings/naver-q4-2025"
    }
  ]
};

const corporateActions: Record<string, CorporateAction[]> = {
  [SAMSUNG_ELECTRONICS]: [
    {
      id: "action-dividend-2025",
      actionType: "dividend",
      effectiveAt: "2026-02-28T00:00:00.000Z",
      summary: "Fixture dividend event used in Phase 0 tests."
    }
  ],
  [SK_HYNIX]: [
    {
      id: "action-capex-2026",
      actionType: "capex",
      effectiveAt: "2026-03-15T00:00:00.000Z",
      summary: "Fixture capital expenditure expansion used in Phase 1 stock route tests."
    }
  ],
  [NAVER]: [
    {
      id: "action-commerce-2026",
      actionType: "strategy",
      effectiveAt: "2026-03-20T00:00:00.000Z",
      summary: "Fixture commerce strategy update used in the noindex branch."
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
