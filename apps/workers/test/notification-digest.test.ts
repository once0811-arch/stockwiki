import { describe, expect, it } from "vitest";
import { buildNotificationDigest } from "../src/notification-digest.js";

describe("notification digest skeleton", () => {
  it("groups unread notification payloads by recipient", () => {
    const result = buildNotificationDigest({
      generatedAt: "2026-04-01T03:30:00.000Z",
      notifications: [
        {
          createdAt: "2026-04-01T03:10:00.000Z",
          id: "notification-member-watch",
          payload: {
            pageKey: "stock:krx:005930",
            pageTitle: "Samsung Electronics",
            summary: "Samsung Electronics page is now on your watchlist."
          },
          readAt: null,
          type: "watch_started",
          userId: "member-1"
        },
        {
          createdAt: "2026-04-01T03:18:00.000Z",
          id: "notification-member-approved",
          payload: {
            actorId: "reviewer-1",
            pageKey: "stock:krx:005930",
            pageTitle: "Samsung Electronics",
            revisionId: "rev-phase7-approved",
            summary: "Samsung Electronics approved revision is now live."
          },
          readAt: null,
          type: "revision_approved",
          userId: "member-1"
        },
        {
          createdAt: "2026-04-01T03:24:00.000Z",
          id: "notification-reviewer-discussion",
          payload: {
            actorId: "contributor-1",
            commentId: "comment-runtime-7",
            pageKey: "stock:krx:000660",
            pageTitle: "SK hynix",
            summary: "SK hynix discussion received a new reply.",
            threadId: "thread-runtime-4"
          },
          readAt: null,
          type: "discussion_reply",
          userId: "reviewer-1"
        }
      ]
    });

    expect(result.recipientCount).toBe(2);
    expect(result.notificationCount).toBe(3);
    expect(result.digests[0]?.userId).toBe("member-1");
    expect(result.digests[0]?.itemCount).toBe(2);
    expect(result.digests[0]?.items[0]?.type).toBe("revision_approved");
    expect(result.digests[1]?.userId).toBe("reviewer-1");
    expect(result.digests[1]?.subject).toContain("1 pending update");
  });
});
