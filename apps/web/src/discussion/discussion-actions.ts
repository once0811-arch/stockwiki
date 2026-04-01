import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import type { StockKey } from "@stockwiki/domain";
import { getStockWikiSnapshot } from "../stock-page/get-stock-wiki-snapshot";
import { notifyWatchersOfDiscussionReply } from "../watchlist/watchlist-actions";
import { getFakeSession, hasFakeRole } from "../wiki-edit/fake-session";
import {
  addDiscussionComment,
  createDiscussionThread,
  getDiscussionCommentRecord,
  getDiscussionThreadRecord,
  listDiscussionThreads,
  reportDiscussionComment,
  setDiscussionThreadLocked,
  setDiscussionThreadPinned,
  toggleDiscussionHelpfulVote
} from "./discussion-store";
import { buildDiscussionPath, discussionReportReasonOptions } from "./discussion-read-model";
import type { DiscussionReportReason } from "./types";

const marketDataProvider = new FixtureMarketDataProvider();

export async function submitDiscussionThread(input: {
  actor?: string;
  bodyMarkdown: string;
  market: string;
  sectionAnchor?: string;
  ticker: string;
  title: string;
}) {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const snapshot = await getStockWikiSnapshot({
    key,
    profile
  });
  listDiscussionThreads(profile.canonicalPageKey);
  const session = requireDiscussionMember(input.actor);
  const title = input.title.trim();
  const bodyMarkdown = input.bodyMarkdown.trim();
  const sectionAnchor = input.sectionAnchor?.trim() || undefined;

  if (!title) {
    throw new Error("Thread title is required");
  }
  if (!bodyMarkdown) {
    throw new Error("Thread body is required");
  }
  if (sectionAnchor && !snapshot.citationSections.some((section) => section.id === sectionAnchor)) {
    throw new Error(`Unknown section anchor ${sectionAnchor}`);
  }

  const thread = createDiscussionThread({
    actorId: session.userId,
    bodyMarkdown,
    pageKey: profile.canonicalPageKey,
    sectionAnchor,
    title
  });

  return {
    canonicalPath: buildDiscussionPath(key, input.actor),
    threadId: thread.id
  };
}

export async function submitDiscussionComment(input: {
  actor?: string;
  bodyMarkdown: string;
  market: string;
  parentCommentId?: string;
  threadId: string;
  ticker: string;
}) {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const pageKey = profile.canonicalPageKey;
  listDiscussionThreads(pageKey);
  const session = requireDiscussionMember(input.actor);
  const thread = requireDiscussionThreadOnPage(input.threadId, pageKey);
  const bodyMarkdown = input.bodyMarkdown.trim();

  if (thread.status === "locked" && !hasFakeRole(session.role, "reviewer")) {
    throw new Error("This thread is locked and cannot accept new replies");
  }
  if (!bodyMarkdown) {
    throw new Error("Comment body is required");
  }
  if (input.parentCommentId) {
    const parentComment = getDiscussionCommentRecord(input.parentCommentId);
    if (!parentComment || parentComment.threadId !== input.threadId) {
      throw new Error("Reply target is invalid");
    }
  }

  const comment = addDiscussionComment({
    actorId: session.userId,
    bodyMarkdown,
    parentCommentId: input.parentCommentId,
    threadId: input.threadId
  });
  notifyWatchersOfDiscussionReply({
    actorId: session.userId,
    commentId: comment.id,
    pageKey,
    pageTitle: profile.name,
    summary: `${profile.name} discussion received a new reply.`,
    threadId: comment.threadId
  });

  return {
    canonicalPath: buildDiscussionPath(key, input.actor),
    commentId: comment.id,
    threadId: comment.threadId
  };
}

export async function submitHelpfulVote(input: {
  actor?: string;
  commentId: string;
  market: string;
  ticker: string;
}) {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const pageKey = profile.canonicalPageKey;
  listDiscussionThreads(pageKey);
  const session = requireDiscussionMember(input.actor);
  requireDiscussionCommentOnPage(input.commentId, pageKey);
  const comment = toggleDiscussionHelpfulVote({
    actorId: session.userId,
    commentId: input.commentId
  });

  return {
    canonicalPath: buildDiscussionPath(key, input.actor),
    commentId: comment.id
  };
}

export async function submitCommentReport(input: {
  actor?: string;
  commentId: string;
  market: string;
  reason: string;
  ticker: string;
}) {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const pageKey = profile.canonicalPageKey;
  listDiscussionThreads(pageKey);
  const session = requireDiscussionMember(input.actor);
  const reason = parseDiscussionReportReason(input.reason);
  requireDiscussionCommentOnPage(input.commentId, pageKey);
  const result = reportDiscussionComment({
    actorId: session.userId,
    commentId: input.commentId,
    reason
  });

  return {
    canonicalPath: buildDiscussionPath(key, input.actor),
    created: result.created,
    reason
  };
}

export async function submitThreadPinToggle(input: {
  actor?: string;
  market: string;
  pinned: boolean;
  threadId: string;
  ticker: string;
}) {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const pageKey = profile.canonicalPageKey;
  listDiscussionThreads(pageKey);
  requireDiscussionReviewer(input.actor);
  requireDiscussionThreadOnPage(input.threadId, pageKey);
  const thread = setDiscussionThreadPinned({
    pinned: input.pinned,
    threadId: input.threadId
  });

  return {
    canonicalPath: buildDiscussionPath(key, input.actor),
    pinned: thread.pinned,
    threadId: thread.id
  };
}

export async function submitThreadLockToggle(input: {
  actor?: string;
  locked: boolean;
  market: string;
  threadId: string;
  ticker: string;
}) {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const pageKey = profile.canonicalPageKey;
  listDiscussionThreads(pageKey);
  requireDiscussionReviewer(input.actor);
  requireDiscussionThreadOnPage(input.threadId, pageKey);
  const thread = setDiscussionThreadLocked({
    locked: input.locked,
    threadId: input.threadId
  });

  return {
    canonicalPath: buildDiscussionPath(key, input.actor),
    status: thread.status,
    threadId: thread.id
  };
}

function requireDiscussionMember(actor?: string) {
  const session = getFakeSession(actor);

  if (!session || !hasFakeRole(session.role, "member")) {
    throw new Error("Member access is required for discussion participation");
  }

  return session;
}

function requireDiscussionReviewer(actor?: string) {
  const session = getFakeSession(actor);

  if (!session || !hasFakeRole(session.role, "reviewer")) {
    throw new Error("Reviewer access is required for discussion moderation");
  }

  return session;
}

function parseDiscussionReportReason(reason: string): DiscussionReportReason {
  const normalizedReason = reason.trim();

  if (discussionReportReasonOptions.some((option) => option.reason === normalizedReason)) {
    return normalizedReason as DiscussionReportReason;
  }

  throw new Error(`Unknown discussion report reason ${normalizedReason}`);
}

function requireDiscussionThreadOnPage(threadId: string, pageKey: string) {
  const thread = getDiscussionThreadRecord(threadId);

  if (!thread || thread.pageKey !== pageKey) {
    throw new Error(`Discussion thread ${threadId} does not belong to ${pageKey}`);
  }

  return thread;
}

function requireDiscussionCommentOnPage(commentId: string, pageKey: string) {
  const comment = getDiscussionCommentRecord(commentId);

  if (!comment) {
    throw new Error(`Unknown discussion comment ${commentId}`);
  }

  requireDiscussionThreadOnPage(comment.threadId, pageKey);

  return comment;
}

function normalizeStockKey(input: StockKey): StockKey {
  return {
    market: input.market.toUpperCase(),
    ticker: input.ticker.toUpperCase()
  };
}
