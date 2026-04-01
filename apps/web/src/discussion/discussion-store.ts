import { discussionSeedPages } from "./discussion-seeds";
import type {
  DiscussionCommentRecord,
  DiscussionCommentStatus,
  DiscussionPreviewItem,
  DiscussionReportReason,
  DiscussionReportRecord,
  DiscussionThreadRecord
} from "./types";

interface DiscussionStoreState {
  commentSequence: number;
  commentsByThread: Map<string, DiscussionCommentRecord[]>;
  reportSequence: number;
  reportsByComment: Map<string, DiscussionReportRecord[]>;
  threadSequence: number;
  threadsByPage: Map<string, DiscussionThreadRecord[]>;
}

declare global {
  var __stockwikiDiscussionStore: DiscussionStoreState | undefined;
}

export function listDiscussionThreads(pageKey: string): DiscussionThreadRecord[] {
  ensureSeeded(pageKey);

  return [...(getStoreState().threadsByPage.get(pageKey) ?? [])].sort(sortThreads);
}

export function listDiscussionComments(threadId: string): DiscussionCommentRecord[] {
  return [...(getStoreState().commentsByThread.get(threadId) ?? [])].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  );
}

export function listCommentReports(commentId: string): DiscussionReportRecord[] {
  return [...(getStoreState().reportsByComment.get(commentId) ?? [])].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  );
}

export function buildDiscussionPreview(pageKey: string): DiscussionPreviewItem[] {
  const threads = listDiscussionThreads(pageKey);

  return threads.slice(0, 2).map((thread) => {
    const comments = listDiscussionComments(thread.id);
    const latestComment = comments.at(-1);

    return {
      id: thread.id,
      replies: Math.max(comments.length - 1, 0),
      sectionAnchor: thread.sectionAnchor,
      status: thread.status,
      summary: latestComment?.bodyMarkdown ?? "새 토론 스레드를 시작해 보세요.",
      title: thread.title
    };
  });
}

export function getDiscussionThreadRecord(threadId: string): DiscussionThreadRecord | undefined {
  return [...getStoreState().threadsByPage.values()]
    .flatMap((threads) => threads)
    .find((candidate) => candidate.id === threadId);
}

export function getDiscussionCommentRecord(commentId: string): DiscussionCommentRecord | undefined {
  return [...getStoreState().commentsByThread.values()]
    .flatMap((comments) => comments)
    .find((candidate) => candidate.id === commentId);
}

export function createDiscussionThread(input: {
  actorId: string;
  bodyMarkdown: string;
  pageKey: string;
  sectionAnchor?: string;
  title: string;
}): DiscussionThreadRecord {
  ensureSeeded(input.pageKey);
  const store = getStoreState();
  store.threadSequence += 1;
  store.commentSequence += 1;
  const createdAt = nextTimestamp(store.threadSequence);
  const threadId = `thread-runtime-${store.threadSequence}`;
  const commentId = `comment-runtime-${store.commentSequence}`;

  const thread: DiscussionThreadRecord = {
    createdAt,
    createdBy: input.actorId,
    id: threadId,
    pageKey: input.pageKey,
    pinned: false,
    sectionAnchor: input.sectionAnchor,
    status: "open",
    title: input.title.trim(),
    updatedAt: createdAt
  };
  const comment: DiscussionCommentRecord = {
    bodyHtml: renderDiscussionMarkdown(input.bodyMarkdown),
    bodyMarkdown: input.bodyMarkdown.trim(),
    createdAt,
    createdBy: input.actorId,
    helpfulVoterIds: [],
    id: commentId,
    status: "visible",
    threadId,
    updatedAt: createdAt
  };

  const threads = store.threadsByPage.get(input.pageKey) ?? [];
  threads.push(thread);
  store.threadsByPage.set(input.pageKey, threads);
  store.commentsByThread.set(threadId, [comment]);

  return thread;
}

export function addDiscussionComment(input: {
  actorId: string;
  bodyMarkdown: string;
  parentCommentId?: string;
  threadId: string;
}): DiscussionCommentRecord {
  const thread = requireDiscussionThread(input.threadId);
  const store = getStoreState();
  store.commentSequence += 1;
  const createdAt = nextTimestamp(store.commentSequence);

  const comment: DiscussionCommentRecord = {
    bodyHtml: renderDiscussionMarkdown(input.bodyMarkdown),
    bodyMarkdown: input.bodyMarkdown.trim(),
    createdAt,
    createdBy: input.actorId,
    helpfulVoterIds: [],
    id: `comment-runtime-${store.commentSequence}`,
    parentCommentId: input.parentCommentId,
    status: "visible",
    threadId: input.threadId,
    updatedAt: createdAt
  };

  const comments = store.commentsByThread.get(input.threadId) ?? [];
  comments.push(comment);
  store.commentsByThread.set(input.threadId, comments);
  thread.updatedAt = createdAt;

  return comment;
}

export function toggleDiscussionHelpfulVote(input: {
  actorId: string;
  commentId: string;
}): DiscussionCommentRecord {
  const comment = requireDiscussionComment(input.commentId);
  const existingIndex = comment.helpfulVoterIds.indexOf(input.actorId);

  if (existingIndex >= 0) {
    comment.helpfulVoterIds.splice(existingIndex, 1);
  } else {
    comment.helpfulVoterIds.push(input.actorId);
  }

  return comment;
}

export function reportDiscussionComment(input: {
  actorId: string;
  commentId: string;
  reason: DiscussionReportReason;
}): { comment: DiscussionCommentRecord; created: boolean } {
  const comment = requireDiscussionComment(input.commentId);
  const store = getStoreState();
  const reports = store.reportsByComment.get(input.commentId) ?? [];
  const existing = reports.find((report) => report.reporterUserId === input.actorId && report.reason === input.reason);

  if (existing) {
    comment.status = resolveCommentStatus(reports);
    return { comment, created: false };
  }

  store.reportSequence += 1;
  reports.push({
    commentId: input.commentId,
    createdAt: nextTimestamp(store.reportSequence + 50),
    id: `report-runtime-${store.reportSequence}`,
    reason: input.reason,
    reporterUserId: input.actorId,
    status: "open"
  });
  store.reportsByComment.set(input.commentId, reports);
  comment.status = resolveCommentStatus(reports);

  return { comment, created: true };
}

export function setDiscussionThreadPinned(input: {
  pinned: boolean;
  threadId: string;
}): DiscussionThreadRecord {
  const thread = requireDiscussionThread(input.threadId);
  thread.pinned = input.pinned;
  return thread;
}

export function setDiscussionThreadLocked(input: {
  locked: boolean;
  threadId: string;
}): DiscussionThreadRecord {
  const thread = requireDiscussionThread(input.threadId);
  thread.status = input.locked ? "locked" : "open";
  return thread;
}

export function resetDiscussionStore(): void {
  const store = getStoreState();
  store.commentSequence = 0;
  store.commentsByThread.clear();
  store.reportSequence = 0;
  store.reportsByComment.clear();
  store.threadSequence = 0;
  store.threadsByPage.clear();
}

function ensureSeeded(pageKey: string): void {
  const store = getStoreState();
  if (store.threadsByPage.has(pageKey)) {
    return;
  }

  const seed = discussionSeedPages[pageKey];
  if (!seed) {
    store.threadsByPage.set(pageKey, []);
    return;
  }

  const threads = seed.threads.map<DiscussionThreadRecord>((thread) => ({
    createdAt: thread.createdAt,
    createdBy: thread.createdBy,
    id: thread.id,
    pageKey,
    pinned: thread.pinned ?? false,
    sectionAnchor: thread.sectionAnchor,
    status: thread.status,
    title: thread.title,
    updatedAt: thread.updatedAt
  }));
  store.threadsByPage.set(pageKey, threads);

  for (const thread of seed.threads) {
    const comments = thread.comments.map<DiscussionCommentRecord>((comment) => ({
      bodyHtml: renderDiscussionMarkdown(comment.bodyMarkdown),
      bodyMarkdown: comment.bodyMarkdown,
      createdAt: comment.createdAt,
      createdBy: comment.createdBy,
      helpfulVoterIds: [...(comment.helpfulVoterIds ?? [])],
      id: comment.id,
      parentCommentId: comment.parentCommentId,
      status: resolveCommentStatusFromSeed(comment.reports),
      threadId: thread.id,
      updatedAt: comment.createdAt
    }));
    store.commentsByThread.set(thread.id, comments);

    for (const comment of thread.comments) {
      if (!comment.reports || comment.reports.length === 0) {
        continue;
      }

      store.reportsByComment.set(
        comment.id,
        comment.reports.map((report) => ({
          commentId: comment.id,
          createdAt: report.createdAt,
          id: report.id,
          reason: report.reason,
          reporterUserId: report.reporterUserId,
          status: report.status ?? "open"
        }))
      );
    }
  }
}

function requireDiscussionThread(threadId: string): DiscussionThreadRecord {
  const thread = [...getStoreState().threadsByPage.values()]
    .flatMap((threads) => threads)
    .find((candidate) => candidate.id === threadId);

  if (!thread) {
    throw new Error(`Unknown discussion thread ${threadId}`);
  }

  return thread;
}

function requireDiscussionComment(commentId: string): DiscussionCommentRecord {
  const comment = [...getStoreState().commentsByThread.values()]
    .flatMap((comments) => comments)
    .find((candidate) => candidate.id === commentId);

  if (!comment) {
    throw new Error(`Unknown discussion comment ${commentId}`);
  }

  return comment;
}

function resolveCommentStatusFromSeed(
  reports?: Array<{ status?: "open" | "reviewed" }>
): DiscussionCommentStatus {
  if (!reports || reports.length === 0) {
    return "visible";
  }

  return reports.some((report) => (report.status ?? "open") === "open") ? "reported" : "visible";
}

function resolveCommentStatus(reports: DiscussionReportRecord[]): DiscussionCommentStatus {
  return reports.some((report) => report.status === "open") ? "reported" : "visible";
}

function sortThreads(left: DiscussionThreadRecord, right: DiscussionThreadRecord): number {
  if (left.pinned !== right.pinned) {
    return left.pinned ? -1 : 1;
  }

  return right.updatedAt.localeCompare(left.updatedAt);
}

function nextTimestamp(sequence: number): string {
  return new Date(Date.UTC(2026, 3, 1, 0, 0, sequence)).toISOString();
}

function renderDiscussionMarkdown(bodyMarkdown: string): string {
  return `<p>${escapeHtml(bodyMarkdown.trim()).replace(/\n/g, "<br />")}</p>`;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getStoreState(): DiscussionStoreState {
  if (!globalThis.__stockwikiDiscussionStore) {
    globalThis.__stockwikiDiscussionStore = {
      commentSequence: 0,
      commentsByThread: new Map<string, DiscussionCommentRecord[]>(),
      reportSequence: 0,
      reportsByComment: new Map<string, DiscussionReportRecord[]>(),
      threadSequence: 0,
      threadsByPage: new Map<string, DiscussionThreadRecord[]>()
    };
  }

  return globalThis.__stockwikiDiscussionStore;
}
