import type { CitationRecord, QueuePriority, ReportReason, RevisionStatus, RevisionSources, SourcePolicyResult } from "@stockwiki/domain";

export interface PendingEditDraft {
  authorId: string;
  changedSectionIds: string[];
  citations: CitationRecord[];
  contentMarkdown: string;
  createdAt: string;
  intentId: string;
  market: string;
  policy: SourcePolicyResult;
  pageKey: string;
  queuePriority: QueuePriority;
  reportReasons: ReportReason[];
  revisionId: string;
  summary: string;
  ticker: string;
  title: string;
  reviewNote?: string;
  reviewedAt?: string;
  reviewerId?: string;
  status: Extract<RevisionStatus, "pending" | "approved" | "rejected">;
}

export interface ReputationEventRecord {
  createdAt: string;
  delta: number;
  eventId: string;
  eventType: "edit_approved" | "edit_rejected";
  refId: string;
  refType: "wiki_revision";
  userId: string;
}

interface PendingEditStoreState {
  draftsByPage: Map<string, PendingEditDraft[]>;
  eventSequence: number;
  reputationEvents: ReputationEventRecord[];
  sequence: number;
}

declare global {
  var __stockwikiPendingEditStore: PendingEditStoreState | undefined;
}

export function listPendingEditDrafts(pageKey: string): PendingEditDraft[] {
  return listStoredEditProposals(pageKey).filter((draft) => draft.status === "pending");
}

export function listReputationEvents(): ReputationEventRecord[] {
  return [...getStoreState().reputationEvents].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function listReviewQueueItems(): PendingEditDraft[] {
  return [...getStoreState().draftsByPage.values()]
    .flatMap((items) => items)
    .filter((draft) => draft.status === "pending")
    .sort((left, right) => {
      if (left.queuePriority !== right.queuePriority) {
        return left.queuePriority === "high" ? -1 : 1;
      }

      return right.createdAt.localeCompare(left.createdAt);
    });
}

export function listStoredEditProposals(pageKey: string): PendingEditDraft[] {
  return [...(getStoreState().draftsByPage.get(pageKey) ?? [])].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  );
}

export function resetPendingEditStore(): void {
  const store = getStoreState();
  store.draftsByPage.clear();
  store.eventSequence = 0;
  store.reputationEvents = [];
  store.sequence = 0;
}

export function savePendingEditDraft(input: {
  authorId: string;
  changedSectionIds: string[];
  citations: CitationRecord[];
  contentMarkdown: string;
  market: string;
  pageKey: string;
  policyEvaluation: RevisionSources;
  summary: string;
  ticker: string;
  title: string;
}): PendingEditDraft {
  const store = getStoreState();
  store.sequence += 1;

  const draft: PendingEditDraft = {
    authorId: input.authorId,
    changedSectionIds: [...input.changedSectionIds],
    citations: [...input.citations],
    contentMarkdown: input.contentMarkdown,
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, store.sequence)).toISOString(),
    intentId: `intent-${store.sequence}`,
    market: input.market.toUpperCase(),
    policy: input.policyEvaluation.policy,
    pageKey: input.pageKey,
    queuePriority: input.policyEvaluation.queuePriority,
    reportReasons: [...input.policyEvaluation.policy.reportReasons],
    revisionId: `rev-edit-${store.sequence}`,
    status: "pending",
    summary: input.summary,
    ticker: input.ticker.toUpperCase(),
    title: input.title
  };

  const drafts = store.draftsByPage.get(input.pageKey) ?? [];
  drafts.push(draft);
  store.draftsByPage.set(input.pageKey, drafts);

  return draft;
}

export function getStoredEditProposal(revisionId: string): PendingEditDraft | undefined {
  return [...getStoreState().draftsByPage.values()]
    .flatMap((items) => items)
    .find((draft) => draft.revisionId === revisionId);
}

export function reviewStoredEditProposal(input: {
  note?: string;
  reviewerId: string;
  revisionId: string;
  status: Extract<RevisionStatus, "approved" | "rejected">;
}): PendingEditDraft {
  const proposal = getStoredEditProposal(input.revisionId);
  if (!proposal) {
    throw new Error(`Unknown revision proposal ${input.revisionId}`);
  }
  if (proposal.status !== "pending") {
    throw new Error(`Revision proposal ${input.revisionId} is already ${proposal.status}`);
  }

  proposal.reviewNote = input.note?.trim() ? input.note.trim() : undefined;
  const store = getStoreState();
  store.eventSequence += 1;
  proposal.reviewedAt = new Date(Date.UTC(2026, 0, 1, 0, 10, store.eventSequence)).toISOString();
  proposal.reviewerId = input.reviewerId;
  proposal.status = input.status;

  store.reputationEvents.unshift({
    createdAt: proposal.reviewedAt,
    delta: input.status === "approved" ? 5 : -1,
    eventId: `rep-${store.eventSequence}`,
    eventType: input.status === "approved" ? "edit_approved" : "edit_rejected",
    refId: proposal.revisionId,
    refType: "wiki_revision",
    userId: proposal.authorId
  });

  return proposal;
}

function getStoreState(): PendingEditStoreState {
  if (!globalThis.__stockwikiPendingEditStore) {
    globalThis.__stockwikiPendingEditStore = {
      draftsByPage: new Map<string, PendingEditDraft[]>(),
      eventSequence: 0,
      reputationEvents: [],
      sequence: 0
    };
  }

  return globalThis.__stockwikiPendingEditStore;
}
