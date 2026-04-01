import { beforeEach, describe, expect, it } from "vitest";
import {
  submitCommentReport,
  submitDiscussionComment,
  submitDiscussionThread,
  submitHelpfulVote,
  submitThreadLockToggle,
  submitThreadPinToggle
} from "../src/discussion/discussion-actions";
import { getStockDiscussionPageData } from "../src/discussion/discussion-read-model";
import { resetDiscussionStore } from "../src/discussion/discussion-store";
import { getStockPageData } from "../src/stock-page/get-stock-page-data";
import { resetWatchlistStore } from "../src/watchlist/watchlist-store";

describe("phase 5 discussion flow", () => {
  beforeEach(() => {
    resetDiscussionStore();
    resetWatchlistStore();
  });

  it("loads fixture-backed discussion threads and summary counts", async () => {
    const data = await getStockDiscussionPageData({
      market: "krx",
      ticker: "005930"
    });

    expect(data.threads).toHaveLength(2);
    expect(data.moderationSummary.threadCount).toBe(2);
    expect(data.moderationSummary.reportedCommentCount).toBe(0);
    expect(data.access.canParticipate).toBe(false);
  });

  it("lets a member create a thread and reply, and stock page summary updates", async () => {
    const threadResult = await submitDiscussionThread({
      actor: "member-1",
      bodyMarkdown: "새 discussion thread를 만들어 section-linked 토론을 시작합니다.",
      market: "krx",
      sectionAnchor: "financial-performance",
      ticker: "005930",
      title: "Phase 5 신규 토론"
    });
    const replyResult = await submitDiscussionComment({
      actor: "contributor-1",
      bodyMarkdown: "reply로 이어서 코멘트를 남깁니다.",
      market: "krx",
      threadId: threadResult.threadId,
      ticker: "005930"
    });
    const discussionPage = await getStockDiscussionPageData({
      actor: "member-1",
      market: "krx",
      ticker: "005930"
    });
    const stockPage = await getStockPageData({
      market: "krx",
      ticker: "005930"
    });
    const createdThread = discussionPage.threads.find((thread) => thread.id === threadResult.threadId);
    const createdPreview = stockPage.discussionPreview.find((thread) => thread.id === threadResult.threadId);

    expect(replyResult.threadId).toBe(threadResult.threadId);
    expect(createdThread?.title).toBe("Phase 5 신규 토론");
    expect(createdThread?.commentCount).toBe(2);
    expect(createdPreview?.title).toBe("Phase 5 신규 토론");
    expect(stockPage.discussionSummary.threadCount).toBe(3);
  });

  it("tracks helpful votes, reports, and reviewer moderation actions", async () => {
    const helpfulResult = await submitHelpfulVote({
      actor: "member-1",
      commentId: "comment-seed-naver-ads-2",
      market: "krx",
      ticker: "035420"
    });
    const reportResult = await submitCommentReport({
      actor: "contributor-1",
      commentId: "comment-seed-naver-ads-1",
      market: "krx",
      reason: "spam",
      ticker: "035420"
    });
    await submitThreadPinToggle({
      actor: "reviewer-1",
      market: "krx",
      pinned: true,
      threadId: "thread-seed-naver-ads",
      ticker: "035420"
    });
    await submitThreadLockToggle({
      actor: "reviewer-1",
      locked: true,
      market: "krx",
      threadId: "thread-seed-naver-ads",
      ticker: "035420"
    });
    const discussionPage = await getStockDiscussionPageData({
      actor: "reviewer-1",
      market: "krx",
      ticker: "035420"
    });

    expect(helpfulResult.commentId).toBe("comment-seed-naver-ads-2");
    expect(reportResult.created).toBe(true);
    expect(discussionPage.moderationSummary.reportedCommentCount).toBe(2);
    expect(discussionPage.threads[0]?.isPinned).toBe(true);
    expect(discussionPage.threads[0]?.status).toBe("locked");
    expect(discussionPage.threads[0]?.rootComments[0]?.reportCount).toBe(1);
  });

  it("blocks member replies when a thread is locked", async () => {
    await submitThreadLockToggle({
      actor: "reviewer-1",
      locked: true,
      market: "krx",
      threadId: "thread-seed-samsung-earnings",
      ticker: "005930"
    });

    await expect(
      submitDiscussionComment({
        actor: "member-1",
        bodyMarkdown: "잠긴 thread에 답글 시도",
        market: "krx",
        threadId: "thread-seed-samsung-earnings",
        ticker: "005930"
      })
    ).rejects.toThrow("This thread is locked and cannot accept new replies");
  });

  it("rejects thread and comment actions that target a different stock page", async () => {
    await getStockDiscussionPageData({
      market: "krx",
      ticker: "035420"
    });

    await expect(
      submitDiscussionComment({
        actor: "member-1",
        bodyMarkdown: "다른 종목 thread에 잘못 연결된 댓글",
        market: "krx",
        threadId: "thread-seed-naver-ads",
        ticker: "005930"
      })
    ).rejects.toThrow("Discussion thread thread-seed-naver-ads does not belong to stock:krx:005930");

    await expect(
      submitCommentReport({
        actor: "member-1",
        commentId: "comment-seed-naver-ads-1",
        market: "krx",
        reason: "spam",
        ticker: "005930"
      })
    ).rejects.toThrow("Discussion thread thread-seed-naver-ads does not belong to stock:krx:005930");

    await expect(
      submitThreadPinToggle({
        actor: "reviewer-1",
        market: "krx",
        pinned: true,
        threadId: "thread-seed-naver-ads",
        ticker: "005930"
      })
    ).rejects.toThrow("Discussion thread thread-seed-naver-ads does not belong to stock:krx:005930");
  });
});
