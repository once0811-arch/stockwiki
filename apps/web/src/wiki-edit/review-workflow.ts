import type { UserRole } from "@stockwiki/domain";
import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import { getStockWikiSnapshot } from "../stock-page/get-stock-wiki-snapshot";
import { getFakeSession, hasFakeRole } from "./fake-session";
import {
  getStoredEditProposal,
  listReputationEvents,
  listReviewQueueItems,
  reviewStoredEditProposal
} from "./pending-edit-store";

const marketDataProvider = new FixtureMarketDataProvider();

export interface ReviewQueueAccess {
  message: string;
  mode: "reviewer_required" | "can_review";
}

export interface ReviewQueueItem {
  authorId: string;
  canonicalPath: string;
  comparePath?: string;
  createdAt: string;
  market: string;
  pageKey: string;
  revisionId: string;
  summary: string;
  ticker: string;
  title: string;
}

export async function getModQueuePageData(input: { actor?: string }) {
  const session = getFakeSession(input.actor);
  const access = evaluateReviewAccess(session?.role);

  if (!session || access.mode !== "can_review") {
    return {
      access,
      pendingItems: [],
      recentEvents: listReputationEvents(),
      session
    };
  }

  const pendingItems = await Promise.all(
    listReviewQueueItems().map(async (proposal): Promise<ReviewQueueItem> => {
      const key = {
        market: proposal.market,
        ticker: proposal.ticker
      };
      const profile = await marketDataProvider.getCompanyProfile(key);
      const snapshot = await getStockWikiSnapshot({
        key,
        profile
      });
      const canonicalPath = `/stocks/${proposal.market.toLowerCase()}/${proposal.ticker.toLowerCase()}`;
      const comparePath =
        snapshot.approvedRevision.id === proposal.revisionId
          ? undefined
          : `${canonicalPath}/diff/${snapshot.approvedRevision.id}...${proposal.revisionId}`;

      return {
        authorId: proposal.authorId,
        canonicalPath,
        comparePath,
        createdAt: proposal.createdAt,
        market: proposal.market,
        pageKey: proposal.pageKey,
        revisionId: proposal.revisionId,
        summary: proposal.summary,
        ticker: proposal.ticker,
        title: proposal.title
      };
    })
  );

  return {
    access,
    pendingItems,
    recentEvents: listReputationEvents(),
    session
  };
}

export async function approveStockEditProposal(input: {
  actor?: string;
  note?: string;
  revisionId: string;
}) {
  const session = getRequiredReviewer(input.actor);
  const proposal = reviewStoredEditProposal({
    note: input.note,
    reviewerId: session.userId,
    revisionId: input.revisionId,
    status: "approved"
  });

  return {
    canonicalPath: `/stocks/${proposal.market.toLowerCase()}/${proposal.ticker.toLowerCase()}`,
    revisionId: proposal.revisionId,
    status: proposal.status
  };
}

export async function rejectStockEditProposal(input: {
  actor?: string;
  note?: string;
  revisionId: string;
}) {
  const session = getRequiredReviewer(input.actor);
  const proposal = reviewStoredEditProposal({
    note: input.note,
    reviewerId: session.userId,
    revisionId: input.revisionId,
    status: "rejected"
  });

  return {
    canonicalPath: `/stocks/${proposal.market.toLowerCase()}/${proposal.ticker.toLowerCase()}`,
    revisionId: proposal.revisionId,
    status: proposal.status
  };
}

export function getReviewedProposalContext(revisionId: string) {
  const proposal = getStoredEditProposal(revisionId);
  if (!proposal) {
    return null;
  }

  return {
    canonicalPath: `/stocks/${proposal.market.toLowerCase()}/${proposal.ticker.toLowerCase()}`,
    revisionId: proposal.revisionId,
    title: proposal.title
  };
}

function evaluateReviewAccess(role?: UserRole): ReviewQueueAccess {
  if (!role || !hasFakeRole(role, "reviewer")) {
    return {
      message: "Reviewer access is required for the moderation queue.",
      mode: "reviewer_required"
    };
  }

  return {
    message: "Reviewer access granted.",
    mode: "can_review"
  };
}

function getRequiredReviewer(actor?: string) {
  const session = getFakeSession(actor);
  const access = evaluateReviewAccess(session?.role);

  if (!session || access.mode !== "can_review") {
    throw new Error(access.message);
  }

  return session;
}
