import {
  FixtureMarketDataProvider,
  searchIndexEventFixtures,
  searchIndexFixtureCheckpoint
} from "@stockwiki/fixtures";
import { FakeWikiEngine } from "@stockwiki/wiki-bridge";
import { InMemoryWikiShadowStore } from "@stockwiki/wiki-bridge/shadow-store";
import { scanCitationLinks } from "./citation-dead-link-scan.js";
import { buildNotificationDigest } from "./notification-digest.js";
import { syncSearchIndex } from "./search-index-sync.js";
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
  const searchSync = syncSearchIndex({
    events: searchIndexEventFixtures,
    indexedThrough: searchIndexFixtureCheckpoint.indexedThrough
  });
  const digest = buildNotificationDigest({
    generatedAt: "2026-04-01T03:30:00.000Z",
    notifications: [
      {
        createdAt: "2026-04-01T03:10:00.000Z",
        id: "worker-notification-watch",
        payload: {
          pageKey: "stock:krx:005930",
          pageTitle: "Samsung Electronics",
          summary: "Samsung Electronics page is now on your watchlist."
        },
        readAt: null,
        type: "watch_started",
        userId: "member-1"
      },
      {
        createdAt: "2026-04-01T03:18:00.000Z",
        id: "worker-notification-approved",
        payload: {
          actorId: "reviewer-1",
          pageKey: "stock:krx:005930",
          pageTitle: "Samsung Electronics",
          revisionId: "rev-phase7-approved",
          summary: "Samsung Electronics approved revision is now live."
        },
        readAt: null,
        type: "revision_approved",
        userId: "member-1"
      }
    ]
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
    digestRecipients: digest.recipientCount,
    digestNotifications: digest.notificationCount,
    phase: 7,
    deadLinks: deadLinkScan.deadCount,
    linkChecks: deadLinkScan.checkedCount,
    searchLagMinutes: searchSync.lag.lagMinutes,
    searchPendingEvents: searchSync.lag.pendingEventCount,
    sampleTicker: quote.ticker,
    syncedPages: syncResult.pageCount,
    syncedRevisions: syncResult.revisionCount
  });
}

void main();
