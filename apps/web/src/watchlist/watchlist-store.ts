import type { NotificationRecord, NotificationType, WatchlistEntry } from "@stockwiki/domain";

interface WatchlistStoreState {
  notificationSequence: number;
  notificationsByUser: Map<string, NotificationRecord[]>;
  watchSequence: number;
  watchesByUser: Map<string, WatchlistEntry[]>;
}

declare global {
  var __stockwikiWatchlistStore: WatchlistStoreState | undefined;
}

export function listWatchlistEntries(userId: string): WatchlistEntry[] {
  return [...(getStoreState().watchesByUser.get(userId) ?? [])].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  );
}

export function listNotifications(userId: string): NotificationRecord[] {
  return [...(getStoreState().notificationsByUser.get(userId) ?? [])].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  );
}

export function listAllNotifications(): NotificationRecord[] {
  return [...getStoreState().notificationsByUser.values()]
    .flatMap((items) => items)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function getWatchlistEntry(input: {
  pageKey: string;
  userId: string;
}): WatchlistEntry | undefined {
  return listWatchlistEntries(input.userId).find(
    (entry) => entry.targetType === "stock_page" && entry.targetId === input.pageKey
  );
}

export function addWatchlistEntry(input: {
  pageKey: string;
  userId: string;
}): { created: boolean; entry: WatchlistEntry } {
  const existingEntry = getWatchlistEntry(input);
  if (existingEntry) {
    return {
      created: false,
      entry: existingEntry
    };
  }

  const store = getStoreState();
  store.watchSequence += 1;
  const entry: WatchlistEntry = {
    createdAt: nextTimestamp(store.watchSequence),
    id: `watch-runtime-${store.watchSequence}`,
    targetId: input.pageKey,
    targetType: "stock_page",
    userId: input.userId
  };

  const userEntries = store.watchesByUser.get(input.userId) ?? [];
  userEntries.push(entry);
  store.watchesByUser.set(input.userId, userEntries);

  return {
    created: true,
    entry
  };
}

export function removeWatchlistEntry(input: {
  entryId: string;
  userId: string;
}): WatchlistEntry {
  const store = getStoreState();
  const userEntries = store.watchesByUser.get(input.userId) ?? [];
  const entryIndex = userEntries.findIndex((entry) => entry.id === input.entryId);

  if (entryIndex < 0) {
    throw new Error(`Unknown watchlist entry ${input.entryId}`);
  }

  const [removedEntry] = userEntries.splice(entryIndex, 1);
  store.watchesByUser.set(input.userId, userEntries);
  return removedEntry;
}

export function createNotification(input: {
  payload: NotificationRecord["payload"];
  type: NotificationType;
  userId: string;
}): NotificationRecord {
  const store = getStoreState();
  store.notificationSequence += 1;
  const notification: NotificationRecord = {
    createdAt: nextTimestamp(store.notificationSequence + 100),
    id: `notification-runtime-${store.notificationSequence}`,
    payload: input.payload,
    readAt: null,
    type: input.type,
    userId: input.userId
  };

  const notifications = store.notificationsByUser.get(input.userId) ?? [];
  notifications.push(notification);
  store.notificationsByUser.set(input.userId, notifications);

  return notification;
}

export function createNotificationsForWatchers(input: {
  actorId?: string;
  pageKey: string;
  payload: NotificationRecord["payload"];
  type: NotificationType;
}): NotificationRecord[] {
  const watcherIds = listWatcherUserIds(input.pageKey).filter((userId) => userId !== input.actorId);

  return watcherIds.map((userId) =>
    createNotification({
      payload: input.payload,
      type: input.type,
      userId
    })
  );
}

export function listWatcherUserIds(pageKey: string): string[] {
  const watcherIds = [...getStoreState().watchesByUser.entries()]
    .filter(([, entries]) => entries.some((entry) => entry.targetType === "stock_page" && entry.targetId === pageKey))
    .map(([userId]) => userId)
    .sort((left, right) => left.localeCompare(right));

  return watcherIds;
}

export function resetWatchlistStore(): void {
  const store = getStoreState();
  store.notificationSequence = 0;
  store.notificationsByUser.clear();
  store.watchSequence = 0;
  store.watchesByUser.clear();
}

function getStoreState(): WatchlistStoreState {
  if (!globalThis.__stockwikiWatchlistStore) {
    globalThis.__stockwikiWatchlistStore = {
      notificationSequence: 0,
      notificationsByUser: new Map(),
      watchSequence: 0,
      watchesByUser: new Map()
    };
  }

  return globalThis.__stockwikiWatchlistStore;
}

function nextTimestamp(offsetMinutes: number): string {
  return new Date(Date.UTC(2026, 3, 1, 1, offsetMinutes, 0)).toISOString();
}
