import { beforeEach, describe, expect, it } from "vitest";
import { resetDiscussionStore } from "../src/discussion/discussion-store";
import { buildStockMetadata } from "../src/stock-page/build-stock-metadata";
import { getStockPageData } from "../src/stock-page/get-stock-page-data";
import { submitWatchlistAdd } from "../src/watchlist/watchlist-actions";
import { resetWatchlistStore } from "../src/watchlist/watchlist-store";

describe("stock page read model", () => {
  beforeEach(() => {
    resetDiscussionStore();
    resetWatchlistStore();
  });

  it("loads fixture-backed stock page data with approved wiki content", async () => {
    const data = await getStockPageData({
      market: "krx",
      ticker: "005930"
    });

    expect(data.profile.name).toBe("Samsung Electronics");
    expect(data.quote.price).toBe(81200);
    expect(data.wiki.reviewed).toBe(true);
    expect(data.wiki.html).toContain("StockWiki Phase 1 fixture page");
    expect(data.canonicalPath).toBe("/stocks/krx/005930");
    expect(data.indexable).toBe(true);
    expect(data.approvedSources.policy.citationCount).toBe(2);
    expect(data.citationSections).toHaveLength(4);
  });

  it("returns real discussion summary data for the stock page", async () => {
    const data = await getStockPageData({
      market: "krx",
      ticker: "005930"
    });

    expect(data.searchPlaceholder).toContain("Search by ticker");
    expect(data.discussionPath).toBe("/stocks/krx/005930/discussion");
    expect(data.discussionSummary.threadCount).toBeGreaterThan(0);
    expect(data.discussionPreview).toHaveLength(2);
    expect(data.discussionPreview[0]?.title).toContain("실적");
  });

  it("preserves actor context in the discussion link", async () => {
    const data = await getStockPageData(
      {
        market: "krx",
        ticker: "005930"
      },
      "member-1"
    );

    expect(data.discussionPath).toBe("/stocks/krx/005930/discussion?actor=member-1");
  });

  it("shows watchlist state and notification center context for signed-in members", async () => {
    await submitWatchlistAdd({
      actor: "member-1",
      market: "krx",
      ticker: "005930"
    });

    const data = await getStockPageData(
      {
        market: "krx",
        ticker: "005930"
      },
      "member-1"
    );

    expect(data.stockPath).toBe("/stocks/krx/005930?actor=member-1");
    expect(data.notificationCenterPath).toBe("/me/watchlist?actor=member-1");
    expect(data.watchState.isWatching).toBe(true);
    expect(data.watchState.unreadNotificationCount).toBe(1);
  });

  it("generates canonical metadata for the stock route", async () => {
    const metadata = buildStockMetadata({
      canonicalPath: "/stocks/krx/005930",
      indexable: true,
      name: "Samsung Electronics",
      ticker: "005930"
    });

    expect(metadata.title).toContain("Samsung Electronics");
    expect(metadata.description).toContain("StockWiki");
    expect(metadata.alternates?.canonical).toBe("/stocks/krx/005930");
    expect(metadata.robots).not.toBe("noindex");
    expect(typeof metadata.robots).toBe("object");
    if (metadata.robots && typeof metadata.robots !== "string") {
      expect(metadata.robots.index).toBe(true);
    }
  });

  it("supports a noindex branch for unreviewed or missing pages", async () => {
    const metadata = buildStockMetadata({
      indexable: false,
      name: "Unknown Stock",
      ticker: "KRX:999999"
    });

    expect(metadata.alternates?.canonical).toBeUndefined();
    expect(typeof metadata.robots).toBe("object");
    if (metadata.robots && typeof metadata.robots !== "string") {
      expect(metadata.robots.index).toBe(false);
      expect(metadata.robots.follow).toBe(false);
    }
  });

  it("loads a second fixture-backed stock page route", async () => {
    const data = await getStockPageData({
      market: "krx",
      ticker: "000660"
    });

    expect(data.profile.name).toBe("SK hynix");
    expect(data.quote.price).toBe(198500);
    expect(data.canonicalPath).toBe("/stocks/krx/000660");
    expect(data.indexable).toBe(true);
    expect(data.wiki.html).toContain("approved revision");
    expect(data.wiki.html).not.toContain("pending revision");
    expect(data.revisionSummary.pendingRevisionCount).toBe(1);
    expect(data.revisionSummary.historyPath).toBe("/stocks/krx/000660/history");
    expect(data.latestSources.policy.status).toBe("warning");
  });

  it("loads a visible but noindex stock page fixture", async () => {
    const data = await getStockPageData({
      market: "krx",
      ticker: "035420"
    });

    expect(data.profile.name).toBe("NAVER");
    expect(data.canonicalPath).toBe("/stocks/krx/035420");
    expect(data.indexable).toBe(false);
  });
});
