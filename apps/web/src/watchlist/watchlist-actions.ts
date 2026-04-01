import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import type { StockKey } from "@stockwiki/domain";
import { getFakeSession, hasFakeRole } from "../wiki-edit/fake-session";
import {
  addWatchlistEntry,
  createNotification,
  createNotificationsForWatchers,
  removeWatchlistEntry
} from "./watchlist-store";

const marketDataProvider = new FixtureMarketDataProvider();

export async function submitWatchlistAdd(input: {
  actor?: string;
  market: string;
  ticker: string;
}) {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const session = requireWatchlistMember(input.actor);
  const result = addWatchlistEntry({
    pageKey: profile.canonicalPageKey,
    userId: session.userId
  });

  if (result.created) {
    createNotification({
      payload: {
        pageKey: profile.canonicalPageKey,
        pageTitle: profile.name,
        summary: `${profile.name} page is now on your watchlist.`
      },
      type: "watch_started",
      userId: session.userId
    });
  }

  return {
    canonicalPath: buildStockPath(key, input.actor),
    created: result.created,
    entryId: result.entry.id,
    watchlistPath: buildWatchlistPath(input.actor)
  };
}

export async function submitWatchlistRemove(input: {
  actor?: string;
  returnTo?: string;
  watchId: string;
}) {
  const session = requireWatchlistMember(input.actor);
  removeWatchlistEntry({
    entryId: input.watchId,
    userId: session.userId
  });

  return {
    redirectPath: buildReturnPath(input.returnTo, input.actor)
  };
}

export function notifyWatchersOfApprovedRevision(input: {
  actorId?: string;
  pageKey: string;
  pageTitle: string;
  revisionId: string;
  summary: string;
}) {
  return createNotificationsForWatchers({
    actorId: input.actorId,
    pageKey: input.pageKey,
    payload: {
      actorId: input.actorId,
      pageKey: input.pageKey,
      pageTitle: input.pageTitle,
      revisionId: input.revisionId,
      summary: input.summary
    },
    type: "revision_approved"
  });
}

export function notifyWatchersOfDiscussionReply(input: {
  actorId?: string;
  commentId: string;
  pageKey: string;
  pageTitle: string;
  summary: string;
  threadId: string;
}) {
  return createNotificationsForWatchers({
    actorId: input.actorId,
    pageKey: input.pageKey,
    payload: {
      actorId: input.actorId,
      commentId: input.commentId,
      pageKey: input.pageKey,
      pageTitle: input.pageTitle,
      summary: input.summary,
      threadId: input.threadId
    },
    type: "discussion_reply"
  });
}

export function buildWatchlistPath(actor?: string): string {
  const basePath = "/me/watchlist";

  if (!actor) {
    return basePath;
  }

  return `${basePath}?actor=${encodeURIComponent(actor)}`;
}

export function buildStockPath(key: StockKey, actor?: string): string {
  const basePath = `/stocks/${key.market.toLowerCase()}/${key.ticker}`;

  if (!actor) {
    return basePath;
  }

  return `${basePath}?actor=${encodeURIComponent(actor)}`;
}

function buildReturnPath(returnTo: string | undefined, actor?: string): string {
  if (!returnTo) {
    return buildWatchlistPath(actor);
  }

  if (!actor || returnTo.includes("actor=")) {
    return returnTo;
  }

  const separator = returnTo.includes("?") ? "&" : "?";
  return `${returnTo}${separator}actor=${encodeURIComponent(actor)}`;
}

function requireWatchlistMember(actor?: string) {
  const session = getFakeSession(actor);

  if (!session || !hasFakeRole(session.role, "member")) {
    throw new Error("Member access is required for watchlist actions");
  }

  return session;
}

function normalizeStockKey(input: StockKey): StockKey {
  return {
    market: input.market.toUpperCase(),
    ticker: input.ticker.toUpperCase()
  };
}
