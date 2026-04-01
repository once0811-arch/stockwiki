import Link from "next/link";
import { PhaseBadge } from "@stockwiki/ui";
import type { NotificationView, WatchlistEntryView, WatchlistPageData } from "./watchlist-read-model";

interface WatchlistPageViewProps {
  actor?: string;
  data: WatchlistPageData;
  error?: string;
  notice?: string;
}

export function WatchlistPageView(props: WatchlistPageViewProps) {
  const { actor, data, error, notice } = props;

  return (
    <main
      style={{
        maxWidth: "72rem",
        margin: "0 auto",
        padding: "3rem 1.5rem 5rem",
        display: "grid",
        gap: "1.5rem"
      }}
    >
      <PhaseBadge>Phase 7 Watchlist Slice</PhaseBadge>

      <header style={heroStyle}>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <h1 style={{ margin: 0, fontSize: "3rem", lineHeight: 1 }}>Watchlist & Notifications</h1>
          <p style={{ margin: 0, maxWidth: "48rem", lineHeight: 1.7 }}>
            Track watched stock pages, approved revision changes, and discussion replies from the same fake-first app layer.
          </p>
        </div>
        {data.session ? (
          <p style={{ margin: 0, color: "#475569" }}>
            Signed in as {data.session.displayName} ({data.session.role})
          </p>
        ) : null}
        <p style={{ margin: 0, color: "#475569" }}>{data.access.message}</p>
        {notice ? <p style={successStyle}>{resolveNotice(notice)}</p> : null}
        {error ? <p style={errorStyle}>{decodeURIComponent(error)}</p> : null}
      </header>

      {data.access.canManage ? (
        <>
          <section style={summaryGridStyle}>
            <article style={summaryCardStyle}>
              <strong>Watched Pages</strong>
              <div>{data.watchlistEntries.length}</div>
            </article>
            <article style={summaryCardStyle}>
              <strong>Unread Notifications</strong>
              <div>{data.unreadCount}</div>
            </article>
            <article style={summaryCardStyle}>
              <strong>Digest Stub</strong>
              <div>{data.digestPreview?.itemCount ?? 0} queued item{data.digestPreview?.itemCount === 1 ? "" : "s"}</div>
            </article>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionHeadingStyle}>Watched Pages</h2>
            {data.watchlistEntries.length === 0 ? (
              <p style={{ margin: 0, color: "#475569" }}>
                No watched pages yet. Add a stock from its public page to start receiving approval and discussion alerts.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {data.watchlistEntries.map((entry) => (
                  <WatchlistEntryCard key={entry.id} actor={actor} entry={entry} />
                ))}
              </div>
            )}
          </section>

          <section style={cardStyle}>
            <h2 style={sectionHeadingStyle}>Notification Center</h2>
            {data.notifications.length === 0 ? (
              <p style={{ margin: 0, color: "#475569" }}>
                In-app notifications will appear here after a watch is added, an edit gets approved, or a watched discussion receives a reply.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {data.notifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </section>

          <section style={cardStyle}>
            <h2 style={sectionHeadingStyle}>Digest Email Stub</h2>
            {data.digestPreview ? (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <p style={{ margin: 0, lineHeight: 1.7 }}>
                  <strong>{data.digestPreview.subject}</strong> would be queued for {data.digestPreview.userId} with{" "}
                  {data.digestPreview.itemCount} unread notification{data.digestPreview.itemCount === 1 ? "" : "s"}.
                </p>
                <ul style={listStyle}>
                  {data.digestPreview.items.map((item) => (
                    <li key={item.notificationId}>
                      <strong>{resolveNotificationItemLabel(item.type)}</strong> / {item.summary}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p style={{ margin: 0, color: "#475569" }}>
                Digest delivery stays a worker-owned stub for now. Once unread items accumulate, the preview subject and queued lines appear here.
              </p>
            )}
            <div style={infoPanelStyle}>
              Immediate delivery: in-app notification center
              <br />
              Deferred delivery: daily email digest stub handled by the Phase 7 worker shell
            </div>
          </section>
        </>
      ) : (
        <section style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Access</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href={`/login?returnTo=${encodeURIComponent("/me/watchlist")}`} style={linkStyle}>
              Continue To Demo Login
            </Link>
            <Link href="/me/watchlist?actor=member-1" style={linkStyle}>
              View As Member
            </Link>
            <Link href="/me/watchlist?actor=reviewer-1" style={linkStyle}>
              View As Reviewer
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

function WatchlistEntryCard(props: {
  actor?: string;
  entry: WatchlistEntryView;
}) {
  const { actor, entry } = props;

  return (
    <article style={entryCardStyle}>
      <div style={{ display: "grid", gap: "0.35rem" }}>
        <Link href={entry.canonicalPath} style={{ ...linkStyle, fontSize: "1.1rem" }}>
          {entry.pageTitle}
        </Link>
        <span style={{ color: "#475569" }}>
          {entry.pageKey} / {entry.notificationCount} related notification{entry.notificationCount === 1 ? "" : "s"}
        </span>
        <span style={{ color: "#475569" }}>Watched since {entry.createdAt}</span>
      </div>
      <form action={`/api/watchlist/${entry.id}`} method="post">
        <input type="hidden" name="actor" value={actor ?? ""} />
        <input type="hidden" name="returnTo" value="/me/watchlist" />
        <button type="submit" style={secondaryButtonStyle}>
          Remove Watch
        </button>
      </form>
    </article>
  );
}

function NotificationCard(props: { notification: NotificationView }) {
  const { notification } = props;

  return (
    <article style={entryCardStyle}>
      <div style={{ display: "grid", gap: "0.35rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <span style={badgeStyle}>{notification.typeLabel}</span>
          {notification.readAt === null ? <span style={unreadStyle}>Unread</span> : null}
        </div>
        <strong>{notification.pageTitle}</strong>
        <span style={{ color: "#475569" }}>{notification.summary}</span>
        <span style={{ color: "#475569" }}>{notification.createdAt}</span>
      </div>
      <Link href={notification.targetPath} style={linkStyle}>
        Open
      </Link>
    </article>
  );
}

function resolveNotice(notice: string): string {
  switch (notice) {
    case "watch_added":
      return "Watchlist entry saved.";
    case "watch_removed":
      return "Watchlist entry removed.";
    default:
      return notice;
  }
}

function resolveNotificationItemLabel(type: NotificationView["type"]): string {
  switch (type) {
    case "watch_started":
      return "Watch Started";
    case "revision_approved":
      return "Revision Approved";
    case "discussion_reply":
      return "Discussion Reply";
  }
}

const heroStyle = {
  display: "grid",
  gap: "0.75rem",
  padding: "2rem",
  borderRadius: "1.5rem",
  background: "linear-gradient(135deg, #ecfccb 0%, #f7fee7 100%)"
} as const;

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem"
} as const;

const summaryCardStyle = {
  display: "grid",
  gap: "0.4rem",
  padding: "1rem 1.1rem",
  borderRadius: "1rem",
  border: "1px solid #d9f99d",
  background: "#ffffff"
} as const;

const cardStyle = {
  display: "grid",
  gap: "1rem",
  padding: "1.5rem",
  borderRadius: "1.5rem",
  background: "#ffffff",
  border: "1px solid #d9f99d"
} as const;

const entryCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  alignItems: "center",
  flexWrap: "wrap",
  padding: "1rem 1.1rem",
  borderRadius: "1rem",
  background: "#f8fafc",
  border: "1px solid #e2e8f0"
} as const;

const sectionHeadingStyle = {
  margin: 0,
  fontSize: "1.3rem"
} as const;

const linkStyle = {
  color: "#0f172a",
  fontWeight: 700,
  textDecoration: "underline"
} as const;

const secondaryButtonStyle = {
  border: "1px solid #0f172a",
  borderRadius: "999px",
  padding: "0.65rem 1rem",
  background: "#fff",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer"
} as const;

const badgeStyle = {
  display: "inline-flex",
  padding: "0.25rem 0.6rem",
  borderRadius: "999px",
  background: "#dcfce7",
  color: "#166534",
  fontSize: "0.82rem",
  fontWeight: 700
} as const;

const unreadStyle = {
  display: "inline-flex",
  padding: "0.25rem 0.6rem",
  borderRadius: "999px",
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: "0.82rem",
  fontWeight: 700
} as const;

const infoPanelStyle = {
  padding: "1rem 1.1rem",
  borderRadius: "1rem",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  lineHeight: 1.7
} as const;

const listStyle = {
  margin: 0,
  paddingLeft: "1.1rem",
  display: "grid",
  gap: "0.6rem"
} as const;

const successStyle = {
  margin: 0,
  padding: "0.75rem 1rem",
  borderRadius: "1rem",
  backgroundColor: "#dcfce7",
  color: "#166534"
} as const;

const errorStyle = {
  margin: 0,
  padding: "0.75rem 1rem",
  borderRadius: "1rem",
  backgroundColor: "#fee2e2",
  color: "#991b1b"
} as const;
