import { beforeEach, describe, expect, it } from "vitest";
import { getStockHistoryPageData } from "../src/stock-page/get-stock-history-page-data";
import { getStockPageData } from "../src/stock-page/get-stock-page-data";
import { approveStockEditProposal, getModQueuePageData, rejectStockEditProposal } from "../src/wiki-edit/review-workflow";
import { getStockEditPageData } from "../src/wiki-edit/get-stock-edit-page-data";
import { listReputationEvents, resetPendingEditStore } from "../src/wiki-edit/pending-edit-store";
import { submitStockEditIntent } from "../src/wiki-edit/submit-stock-edit-intent";

describe("phase 3 edit proposal flow", () => {
  beforeEach(() => {
    resetPendingEditStore();
  });

  it("gates edit entry by fake session role", async () => {
    const anonymous = await getStockEditPageData({
      market: "krx",
      ticker: "005930"
    });
    const member = await getStockEditPageData({
      market: "krx",
      ticker: "005930",
      actor: "member-1"
    });
    const contributor = await getStockEditPageData({
      market: "krx",
      ticker: "005930",
      actor: "contributor-1"
    });

    expect(anonymous.access.mode).toBe("login_required");
    expect(member.access.mode).toBe("needs_contributor");
    expect(contributor.access.mode).toBe("can_edit");
    expect(contributor.prefillContent).toContain("Samsung Electronics");
  });

  it("stores a pending revision while public render stays pinned to approved content", async () => {
    const result = await submitStockEditIntent({
      actor: "contributor-1",
      contentMarkdown:
        "StockWiki Phase 3 pending revision.\nSamsung Electronics pending revision adds a business structure update.",
      market: "krx",
      summary: "phase 3 pending revision",
      ticker: "005930"
    });

    expect(result.status).toBe("pending");
    expect(result.actor.role).toBe("contributor");

    const publicPage = await getStockPageData({
      market: "krx",
      ticker: "005930"
    });
    const historyPage = await getStockHistoryPageData({
      market: "krx",
      ticker: "005930"
    });

    expect(publicPage.wiki.html).toContain("Phase 1 fixture page");
    expect(publicPage.wiki.html).not.toContain("Phase 3 pending revision");
    expect(publicPage.revisionSummary.pendingRevisionCount).toBe(1);
    expect(historyPage.history[0]?.summary).toBe("phase 3 pending revision");
    expect(historyPage.history[0]?.status).toBe("pending");
  });

  it("lets a reviewer approve a pending revision and records a reputation event", async () => {
    const pending = await submitStockEditIntent({
      actor: "contributor-1",
      contentMarkdown:
        "StockWiki Phase 3 approved revision.\nSamsung Electronics approved revision now reflects reviewer approval.",
      market: "krx",
      summary: "phase 3 approval candidate",
      ticker: "005930"
    });
    const queueBefore = await getModQueuePageData({
      actor: "reviewer-1"
    });

    expect(queueBefore.pendingItems).toHaveLength(1);
    expect(queueBefore.pendingItems[0]?.revisionId).toBe(pending.revisionId);

    const reviewResult = await approveStockEditProposal({
      actor: "reviewer-1",
      note: "approved in test",
      revisionId: pending.revisionId
    });
    const publicPage = await getStockPageData({
      market: "krx",
      ticker: "005930"
    });
    const historyPage = await getStockHistoryPageData({
      market: "krx",
      ticker: "005930"
    });
    const queueAfter = await getModQueuePageData({
      actor: "reviewer-1"
    });
    const reputationEvents = listReputationEvents();

    expect(reviewResult.status).toBe("approved");
    expect(publicPage.wiki.html).toContain("Phase 3 approved revision");
    expect(publicPage.revisionSummary.pendingRevisionCount).toBe(0);
    expect(historyPage.history[0]?.status).toBe("approved");
    expect(queueAfter.pendingItems).toHaveLength(0);
    expect(reputationEvents[0]?.eventType).toBe("edit_approved");
    expect(reputationEvents[0]?.refId).toBe(pending.revisionId);
  });

  it("lets a reviewer reject a pending revision while the public page stays pinned", async () => {
    const pending = await submitStockEditIntent({
      actor: "contributor-1",
      contentMarkdown:
        "StockWiki Phase 3 rejected revision.\nNAVER rejected revision should stay out of the public approved render.",
      market: "krx",
      summary: "phase 3 rejection candidate",
      ticker: "035420"
    });

    const reviewResult = await rejectStockEditProposal({
      actor: "reviewer-1",
      note: "rejected in test",
      revisionId: pending.revisionId
    });
    const publicPage = await getStockPageData({
      market: "krx",
      ticker: "035420"
    });
    const historyPage = await getStockHistoryPageData({
      market: "krx",
      ticker: "035420"
    });
    const reputationEvents = listReputationEvents();

    expect(reviewResult.status).toBe("rejected");
    expect(publicPage.wiki.html).toContain("Phase 1 noindex fixture page");
    expect(publicPage.wiki.html).not.toContain("Phase 3 rejected revision");
    expect(publicPage.revisionSummary.pendingRevisionCount).toBe(0);
    expect(historyPage.history[0]?.status).toBe("rejected");
    expect(reputationEvents[0]?.eventType).toBe("edit_rejected");
    expect(reputationEvents[0]?.refId).toBe(pending.revisionId);
  });
});
