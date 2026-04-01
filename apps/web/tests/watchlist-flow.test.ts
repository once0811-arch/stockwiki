import { beforeEach, describe, expect, it } from "vitest";
import { submitDiscussionComment } from "../src/discussion/discussion-actions";
import { resetDiscussionStore } from "../src/discussion/discussion-store";
import { getWatchlistPageData } from "../src/watchlist/watchlist-read-model";
import { submitWatchlistAdd, submitWatchlistRemove } from "../src/watchlist/watchlist-actions";
import { resetWatchlistStore } from "../src/watchlist/watchlist-store";
import { approveStockEditProposal } from "../src/wiki-edit/review-workflow";
import { resetPendingEditStore } from "../src/wiki-edit/pending-edit-store";
import { submitStockEditIntent } from "../src/wiki-edit/submit-stock-edit-intent";

describe("phase 7 watchlist and notification flow", () => {
  beforeEach(() => {
    resetDiscussionStore();
    resetPendingEditStore();
    resetWatchlistStore();
  });

  it("gates notification center access for anonymous users", async () => {
    const data = await getWatchlistPageData({});

    expect(data.access.canManage).toBe(false);
    expect(data.watchlistEntries).toHaveLength(0);
    expect(data.notifications).toHaveLength(0);
  });

  it("lets a member add and remove a watched page", async () => {
    const addResult = await submitWatchlistAdd({
      actor: "member-1",
      market: "krx",
      ticker: "005930"
    });
    const watchlistAfterAdd = await getWatchlistPageData({
      actor: "member-1"
    });

    expect(addResult.created).toBe(true);
    expect(watchlistAfterAdd.watchlistEntries).toHaveLength(1);
    expect(watchlistAfterAdd.notifications[0]?.type).toBe("watch_started");
    expect(watchlistAfterAdd.digestPreview?.itemCount).toBe(1);

    const removeResult = await submitWatchlistRemove({
      actor: "member-1",
      returnTo: "/me/watchlist",
      watchId: watchlistAfterAdd.watchlistEntries[0]!.id
    });
    const watchlistAfterRemove = await getWatchlistPageData({
      actor: "member-1"
    });

    expect(removeResult.redirectPath).toBe("/me/watchlist?actor=member-1");
    expect(watchlistAfterRemove.watchlistEntries).toHaveLength(0);
  });

  it("creates approval and discussion reply notifications for watched pages", async () => {
    await submitWatchlistAdd({
      actor: "member-1",
      market: "krx",
      ticker: "005930"
    });
    const pending = await submitStockEditIntent({
      actor: "contributor-1",
      changedSectionIds: ["financial-performance"],
      citations: [
        {
          id: "citation-watchlist-approval",
          label: "Samsung Electronics Q4 2025 earnings release",
          publishedAt: "2026-01-31",
          sectionId: "financial-performance",
          sourceTier: "tier1",
          sourceUrl: "https://example.test/filings/samsung-q4-2025"
        }
      ],
      contentMarkdown: "Phase 7 watchlist approval candidate.",
      market: "krx",
      summary: "phase 7 approval candidate",
      ticker: "005930"
    });
    await approveStockEditProposal({
      actor: "reviewer-1",
      revisionId: pending.revisionId
    });
    await submitDiscussionComment({
      actor: "contributor-1",
      bodyMarkdown: "Phase 7 notification reply.",
      market: "krx",
      threadId: "thread-seed-samsung-earnings",
      ticker: "005930"
    });

    const data = await getWatchlistPageData({
      actor: "member-1"
    });

    expect(data.watchlistEntries).toHaveLength(1);
    expect(data.notifications.map((notification) => notification.type)).toEqual([
      "discussion_reply",
      "revision_approved",
      "watch_started"
    ]);
    expect(data.notifications[0]?.summary).toContain("discussion received a new reply");
    expect(data.notifications[1]?.summary).toContain("approved revision is now live");
    expect(data.digestPreview?.itemCount).toBe(3);
  });
});
