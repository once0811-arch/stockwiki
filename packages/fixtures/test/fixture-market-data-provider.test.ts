import { createPhase0MarketDataProviderContractSuite } from "@stockwiki/testkit";
import { describe, expect, it } from "vitest";
import { FixtureMarketDataProvider } from "../src/index.js";

describe("FixtureMarketDataProvider", () => {
  createPhase0MarketDataProviderContractSuite("FixtureMarketDataProvider contract", () => new FixtureMarketDataProvider());

  it("returns the phase 0 fixture quote", async () => {
    const provider = new FixtureMarketDataProvider();
    await expect(
      provider.getQuote({
        market: "KRX",
        ticker: "005930"
      })
    ).resolves.toMatchObject({
      ticker: "005930"
    });
  });

  it("returns the phase 1 secondary fixture quote", async () => {
    const provider = new FixtureMarketDataProvider();
    await expect(
      provider.getQuote({
        market: "KRX",
        ticker: "000660"
      })
    ).resolves.toMatchObject({
      ticker: "000660"
    });
  });

  it("returns alias-aware company profiles for search fixtures", async () => {
    const provider = new FixtureMarketDataProvider();
    await expect(
      provider.getCompanyProfile({
        market: "KRX",
        ticker: "005930"
      })
    ).resolves.toMatchObject({
      aliases: ["SEC", "Samsung Elec"]
    });
  });
});
