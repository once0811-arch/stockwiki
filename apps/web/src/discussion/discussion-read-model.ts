import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import type { StockKey } from "@stockwiki/domain";
import { getStockWikiSnapshot } from "../stock-page/get-stock-wiki-snapshot";
import { getFakeSession, hasFakeRole } from "../wiki-edit/fake-session";
import {
  buildDiscussionPreview,
  listCommentReports,
  listDiscussionComments,
  listDiscussionThreads
} from "./discussion-store";
import type {
  DiscussionCommentRecord,
  DiscussionCommentStatus,
  DiscussionReportReason,
  DiscussionThreadStatus
} from "./types";

const marketDataProvider = new FixtureMarketDataProvider();

export interface DiscussionAccessState {
  canModerate: boolean;
  canParticipate: boolean;
  message: string;
}

export interface DiscussionCommentView {
  authorId: string;
  bodyHtml: string;
  bodyMarkdown: string;
  createdAt: string;
  helpfulCount: number;
  id: string;
  reportCount: number;
  replies: DiscussionCommentView[];
  status: DiscussionCommentStatus;
  userHasHelpfulVote: boolean;
}

export interface DiscussionThreadView {
  canReply: boolean;
  commentCount: number;
  createdAt: string;
  createdBy: string;
  id: string;
  isPinned: boolean;
  latestActivityAt: string;
  rootComments: DiscussionCommentView[];
  sectionAnchor?: string;
  sectionLabel?: string;
  status: DiscussionThreadStatus;
  title: string;
}

export interface DiscussionSummarySnapshot {
  lockedThreadCount: number;
  openThreadCount: number;
  reportedCommentCount: number;
  resolvedThreadCount: number;
  threadCount: number;
}

export async function getStockDiscussionPageData(input: StockKey & { actor?: string }) {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const snapshot = await getStockWikiSnapshot({
    key,
    profile
  });
  const session = getFakeSession(input.actor);
  const access = evaluateDiscussionAccess(input.actor);
  const threadRecords = listDiscussionThreads(profile.canonicalPageKey);
  const threads = threadRecords.map((thread) => toThreadView(thread, input.actor));

  return {
    access,
    actor: input.actor,
    discussionPath: buildDiscussionPath(key, input.actor),
    moderationSummary: buildDiscussionSummary(threadRecords),
    profile,
    sectionOptions: snapshot.citationSections.map((section) => ({
      description: section.description,
      id: section.id,
      label: section.label
    })),
    session,
    stockPath: buildStockPath(key, input.actor),
    threads
  };
}

export async function getStockDiscussionPreviewData(input: StockKey, actor?: string) {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const threadRecords = listDiscussionThreads(profile.canonicalPageKey);

  return {
    discussionPath: buildDiscussionPath(key, actor),
    previewItems: buildDiscussionPreview(profile.canonicalPageKey),
    summary: buildDiscussionSummary(threadRecords)
  };
}

export function evaluateDiscussionAccess(actor?: string): DiscussionAccessState {
  const session = getFakeSession(actor);

  if (!session) {
    return {
      canModerate: false,
      canParticipate: false,
      message: "Sign in to create threads, reply, vote, or report discussion content."
    };
  }

  return {
    canModerate: hasFakeRole(session.role, "reviewer"),
    canParticipate: hasFakeRole(session.role, "member"),
    message: hasFakeRole(session.role, "reviewer")
      ? "Reviewer access granted for discussion participation and moderation."
      : "Member access granted for discussion participation."
  };
}

export function buildDiscussionPath(key: StockKey, actor?: string): string {
  const basePath = `/stocks/${key.market.toLowerCase()}/${key.ticker}/discussion`;

  if (!actor) {
    return basePath;
  }

  return `${basePath}?actor=${encodeURIComponent(actor)}`;
}

function buildStockPath(key: StockKey, actor?: string): string {
  const basePath = `/stocks/${key.market.toLowerCase()}/${key.ticker}`;

  if (!actor) {
    return basePath;
  }

  return `${basePath}?actor=${encodeURIComponent(actor)}`;
}

function buildDiscussionSummary(threadRecords: Array<{ status: DiscussionThreadStatus; id: string }>): DiscussionSummarySnapshot {
  return {
    lockedThreadCount: threadRecords.filter((thread) => thread.status === "locked").length,
    openThreadCount: threadRecords.filter((thread) => thread.status === "open").length,
    reportedCommentCount: threadRecords
      .flatMap((thread) => listDiscussionComments(thread.id))
      .filter((comment) => comment.status === "reported").length,
    resolvedThreadCount: threadRecords.filter((thread) => thread.status === "resolved").length,
    threadCount: threadRecords.length
  };
}

function toThreadView(
  thread: {
    createdAt: string;
    createdBy: string;
    id: string;
    pinned: boolean;
    sectionAnchor?: string;
    status: DiscussionThreadStatus;
    title: string;
    updatedAt: string;
  },
  actor?: string
): DiscussionThreadView {
  const comments = listDiscussionComments(thread.id);
  const commentViews = buildCommentTree(comments, actor);

  return {
    canReply: thread.status !== "locked",
    commentCount: comments.length,
    createdAt: thread.createdAt,
    createdBy: thread.createdBy,
    id: thread.id,
    isPinned: thread.pinned,
    latestActivityAt: thread.updatedAt,
    rootComments: commentViews,
    sectionAnchor: thread.sectionAnchor,
    sectionLabel: resolveSectionLabel(thread.sectionAnchor),
    status: thread.status,
    title: thread.title
  };
}

function buildCommentTree(comments: DiscussionCommentRecord[], actor?: string): DiscussionCommentView[] {
  const childMap = new Map<string, DiscussionCommentView[]>();
  const userId = getFakeSession(actor)?.userId;

  const commentViews = comments.map<DiscussionCommentView>((comment) => ({
    authorId: comment.createdBy,
    bodyHtml: comment.bodyHtml,
    bodyMarkdown: comment.bodyMarkdown,
    createdAt: comment.createdAt,
    helpfulCount: comment.helpfulVoterIds.length,
    id: comment.id,
    reportCount: listCommentReports(comment.id).filter((report) => report.status === "open").length,
    replies: [],
    status: comment.status,
    userHasHelpfulVote: userId ? comment.helpfulVoterIds.includes(userId) : false
  }));
  const viewMap = new Map(commentViews.map((comment) => [comment.id, comment]));

  for (const comment of comments) {
    if (!comment.parentCommentId) {
      continue;
    }

    const parentReplies = childMap.get(comment.parentCommentId) ?? [];
    const childView = viewMap.get(comment.id);
    if (childView) {
      parentReplies.push(childView);
      childMap.set(comment.parentCommentId, parentReplies);
    }
  }

  for (const commentView of commentViews) {
    commentView.replies = childMap.get(commentView.id) ?? [];
  }

  return comments
    .filter((comment) => !comment.parentCommentId)
    .map((comment) => viewMap.get(comment.id))
    .filter((comment): comment is DiscussionCommentView => Boolean(comment));
}

function normalizeStockKey(input: StockKey): StockKey {
  return {
    market: input.market.toUpperCase(),
    ticker: input.ticker.toUpperCase()
  };
}

function resolveSectionLabel(sectionAnchor?: string): string | undefined {
  if (!sectionAnchor) {
    return undefined;
  }

  return buildDiscussionSectionLabelMap().get(sectionAnchor) ?? sectionAnchor;
}

function buildDiscussionSectionLabelMap(): Map<string, string> {
  return new Map([
    ["business-model", "Business Model"],
    ["financial-performance", "Financial Performance"],
    ["recent-events", "Recent Events"],
    ["governance-risk", "Governance & Risk"]
  ]);
}

export const discussionReportReasonOptions: Array<{
  description: string;
  reason: DiscussionReportReason;
}> = [
  {
    reason: "misinformation",
    description: "Unverified or misleading factual claim"
  },
  {
    reason: "abuse",
    description: "Harassment, attack, or hostile tone"
  },
  {
    reason: "spam",
    description: "Promotion, solicitation, or off-topic noise"
  }
];
