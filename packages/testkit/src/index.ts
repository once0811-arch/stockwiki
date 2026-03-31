import { describe, expect, it } from "vitest";
import type {
  EditPageInput,
  MarketDataProvider,
  StockKey,
  WikiEngine
} from "@stockwiki/domain";

const phase0PageKey = "stock:krx:005930";
const phase0StockKey: StockKey = {
  market: "KRX",
  ticker: "005930"
};

function makeEdit(overrides: Partial<EditPageInput> = {}): EditPageInput {
  return {
    key: phase0PageKey,
    title: "Samsung Electronics",
    summary: "phase 0 seed",
    contentMarkdown: "Initial approved revision",
    authorId: "system",
    ...overrides
  };
}

export function createPhase0WikiEngineContractSuite(name: string, createEngine: () => WikiEngine): void {
  describe(name, () => {
    it("creates a page and stores revision history", async () => {
      const engine = createEngine();
      const first = await engine.createOrUpdatePage(makeEdit());
      const second = await engine.createOrUpdatePage(
        makeEdit({
          summary: "pending edit",
          contentMarkdown: "Pending revision"
        })
      );

      expect(first.status).toBe("approved");
      expect(second.status).toBe("pending");

      const history = await engine.getHistory(phase0PageKey);
      expect(history).toHaveLength(2);
      expect(history[0]?.status).toBe("pending");
      expect(history[1]?.status).toBe("approved");
    });

    it("returns approved content for public rendering", async () => {
      const engine = createEngine();
      const approved = await engine.createOrUpdatePage(makeEdit());
      await engine.createOrUpdatePage(
        makeEdit({
          summary: "new draft",
          contentMarkdown: "Draft that should not be public yet"
        })
      );

      const rendered = await engine.getRenderedHtml(phase0PageKey);
      expect(rendered.revisionId).toBe(approved.revisionId);
      expect(rendered.reviewed).toBe(true);
      expect(rendered.html).toContain("Initial approved revision");
    });

    it("compares revisions, protects pages, and rolls back", async () => {
      const engine = createEngine();
      const first = await engine.createOrUpdatePage(makeEdit());
      const second = await engine.createOrUpdatePage(
        makeEdit({
          summary: "phase 0 update",
          contentMarkdown: "Line 1\nLine 2"
        })
      );

      const diff = await engine.compareRevisions(phase0PageKey, first.revisionId, second.revisionId);
      expect(diff.changedLineCount).toBeGreaterThan(0);

      await engine.protectPage({
        key: phase0PageKey,
        protectionLevel: "semi_protected"
      });

      const page = await engine.getPage(phase0PageKey);
      expect(page?.protectionLevel).toBe("semi_protected");

      const rollback = await engine.rollback({
        key: phase0PageKey,
        toRevisionId: first.revisionId,
        authorId: "reviewer-1",
        summary: "rollback to approved"
      });

      expect(rollback.restoredRevisionId).toBe(first.revisionId);

      const rendered = await engine.getRenderedHtml(phase0PageKey);
      expect(rendered.html).toContain("Initial approved revision");
    });
  });
}

export function createPhase0MarketDataProviderContractSuite(
  name: string,
  createProvider: () => MarketDataProvider
): void {
  describe(name, () => {
    it("returns quote, profile, filings, and corporate actions", async () => {
      const provider = createProvider();

      await expect(provider.getQuote(phase0StockKey)).resolves.toMatchObject({
        ticker: "005930"
      });
      await expect(provider.getCompanyProfile(phase0StockKey)).resolves.toMatchObject({
        canonicalPageKey: phase0PageKey
      });
      await expect(provider.getRecentFilings(phase0StockKey)).resolves.toHaveLength(1);
      await expect(provider.getCorporateActions(phase0StockKey)).resolves.toHaveLength(1);
    });

    it("fails loudly when a fixture is missing", async () => {
      const provider = createProvider();

      await expect(
        provider.getQuote({
          market: "NASDAQ",
          ticker: "NVDA"
        })
      ).rejects.toThrow("Missing quote fixture");
    });
  });
}
