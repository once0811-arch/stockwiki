import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import { buildNotificationDigestResult, type NotificationRecord, type StockKey } from "@stockwiki/domain";
import { buildDiscussionPath } from "../discussion/discussion-read-model";
import { getFakeSession, hasFakeRole } from "../wiki-edit/fake-session";
import { buildStockPath, buildWatchlistPath } from "./watchlist-actions";
import { getWatchlistEntry, listNotifications, listWatchlistEntries } from "./watchlist-store";

const marketDataProvider = new FixtureMarketDataProvider();

export interface WatchlistAccessState {
  canManage: boolean;
  message: string;
  mode: "can_manage" | "login_required";
}

export interface StockWatchState {
  access: WatchlistAccessState;
  isWatching: boolean;
  notificationCenterPath: string;
  unreadNotificationCount: number;
  watchId?: string;
  watchlistPath: string;
}

export interface WatchlistEntryView {
  canonicalPath: string;
  createdAt: string;
  id: string;
  notificationCount: number;
  pageKey: string;
  pageTitle: string;
}

export interface NotificationView {
  createdAt: string;
  id: string;
  pageTitle: string;
  readAt: string | null;
  summary: string;
  targetPath: string;
  type: NotificationRecord["type"];
  typeLabel: string;
}

export interface WatchlistPageData {
  access: WatchlistAccessState;
  digestPreview: ReturnType<typeof buildNotificationDigestResult>["digests"][number] | null;
  notifications: NotificationView[];
  session: ReturnType<typeof getFakeSession>;
  unreadCount: number;
  watchlistEntries: WatchlistEntryView[];
}

export async function getStockWatchState(input: StockKey & { actor?: string }): Promise<StockWatchState> {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const access = evaluateWatchlistAccess(input.actor);
  const session = getFakeSession(input.actor);
  const watchEntry = session ? getWatchlistEntry({ pageKey: profile.canonicalPageKey, userId: session.userId }) : undefined;
  const unreadNotificationCount = session
    ? listNotifications(session.userId).filter((notification) => notification.readAt === null).length
    : 0;

  return {
    access,
    isWatching: Boolean(watchEntry),
    notificationCenterPath: buildWatchlistPath(input.actor),
    unreadNotificationCount,
    watchId: watchEntry?.id,
    watchlistPath: buildWatchlistPath(input.actor)
  };
}

export async function getWatchlistPageData(input: { actor?: string }): Promise<WatchlistPageData> {
  const access = evaluateWatchlistAccess(input.actor);
  const session = getFakeSession(input.actor);

  if (!session || !access.canManage) {
    return {
      access,
      digestPreview: null,
      notifications: [],
      session,
      unreadCount: 0,
      watchlistEntries: []
    };
  }

  const entryRecords = listWatchlistEntries(session.userId);
  const notificationRecords = listNotifications(session.userId);
  const watchlistEntries = await Promise.all(entryRecords.map((entry) => toWatchlistEntryView(entry, input.actor)));
  const notifications = notificationRecords.map((notification) => toNotificationView(notification, input.actor));
  const digestPreview =
    buildNotificationDigestResult({
      generatedAt: "2026-04-01T03:30:00.000Z",
      notifications: notificationRecords.filter((notification) => notification.readAt === null)
    }).digests[0] ?? null;

  return {
    access,
    digestPreview,
    notifications,
    session,
    unreadCount: notifications.filter((notification) => notification.readAt === null).length,
    watchlistEntries
  };
}

export function evaluateWatchlistAccess(actor?: string): WatchlistAccessState {
  const session = getFakeSession(actor);

  if (!session) {
    return {
      canManage: false,
      message: "Sign in to manage watched pages and receive notification center updates.",
      mode: "login_required"
    };
  }

  if (!hasFakeRole(session.role, "member")) {
    return {
      canManage: false,
      message: "Member access is required for watchlists and notifications.",
      mode: "login_required"
    };
  }

  return {
    canManage: true,
    message: "Member access granted for watchlists and notifications.",
    mode: "can_manage"
  };
}

async function toWatchlistEntryView(
  entry: {
    createdAt: string;
    id: string;
    targetId: string;
  },
  actor?: string
): Promise<WatchlistEntryView> {
  const key = parseStockPageKey(entry.targetId);
  const profile = await marketDataProvider.getCompanyProfile(key);

  return {
    canonicalPath: buildStockPath(key, actor),
    createdAt: entry.createdAt,
    id: entry.id,
    notificationCount: listNotificationsForPage(profile.canonicalPageKey, actor).length,
    pageKey: profile.canonicalPageKey,
    pageTitle: profile.name
  };
}

function toNotificationView(notification: NotificationRecord, actor?: string): NotificationView {
  return {
    createdAt: notification.createdAt,
    id: notification.id,
    pageTitle: notification.payload.pageTitle,
    readAt: notification.readAt,
    summary: notification.payload.summary,
    targetPath: buildNotificationTargetPath(notification, actor),
    type: notification.type,
    typeLabel: resolveNotificationTypeLabel(notification.type)
  };
}

function buildNotificationTargetPath(notification: NotificationRecord, actor?: string): string {
  const key = parseStockPageKey(notification.payload.pageKey);

  if (notification.type === "discussion_reply") {
    const path = buildDiscussionPath(key, actor);
    return notification.payload.commentId ? `${path}#${notification.payload.commentId}` : path;
  }

  return buildStockPath(key, actor);
}

function resolveNotificationTypeLabel(type: NotificationRecord["type"]): string {
  switch (type) {
    case "watch_started":
      return "Watch Started";
    case "revision_approved":
      return "Revision Approved";
    case "discussion_reply":
      return "Discussion Reply";
  }
}

function listNotificationsForPage(pageKey: string, actor?: string): NotificationRecord[] {
  const session = getFakeSession(actor);
  if (!session) {
    return [];
  }

  return listNotifications(session.userId).filter((notification) => notification.payload.pageKey === pageKey);
}

function parseStockPageKey(pageKey: string): StockKey {
  const [resource, market, ticker] = pageKey.split(":");

  if (resource !== "stock" || !market || !ticker) {
    throw new Error(`Unsupported watch target ${pageKey}`);
  }

  return {
    market: market.toUpperCase(),
    ticker: ticker.toUpperCase()
  };
}

function normalizeStockKey(input: StockKey): StockKey {
  return {
    market: input.market.toUpperCase(),
    ticker: input.ticker.toUpperCase()
  };
}
