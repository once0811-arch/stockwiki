import { buildNotificationDigestResult, type NotificationDigestResult, type NotificationRecord } from "@stockwiki/domain";

export function buildNotificationDigest(input: {
  generatedAt: string;
  notifications: NotificationRecord[];
}): NotificationDigestResult {
  return buildNotificationDigestResult(input);
}
