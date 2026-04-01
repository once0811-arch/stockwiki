import Link from "next/link";
import { getModQueuePageData, getReviewedProposalContext } from "../../../src/wiki-edit/review-workflow";

interface ModQueueRouteProps {
  searchParams: Promise<{
    actor?: string | string[];
    decision?: string | string[];
    error?: string | string[];
    revisionId?: string | string[];
  }>;
}

export default async function ModQueuePage(props: ModQueueRouteProps) {
  const searchParams = await props.searchParams;
  const actor = readParam(searchParams.actor);
  const decision = readParam(searchParams.decision);
  const error = readParam(searchParams.error);
  const revisionId = readParam(searchParams.revisionId);
  const data = await getModQueuePageData({
    actor
  });
  const reviewedContext = revisionId ? getReviewedProposalContext(revisionId) : null;

  return (
    <main
      style={{
        maxWidth: "70rem",
        margin: "0 auto",
        padding: "3rem 1.5rem 5rem",
        display: "grid",
        gap: "1.5rem"
      }}
    >
      <header style={heroStyle}>
        <p style={eyebrowStyle}>Moderator / Reviewer</p>
        <h1 style={titleStyle}>{data.access.mode === "can_review" ? "Moderation Queue" : "Reviewer Access Required"}</h1>
        <p style={descriptionStyle}>{data.access.message}</p>
        {data.session ? (
          <p style={{ margin: 0, color: "#475569" }}>
            Signed in as {data.session.displayName} ({data.session.role})
          </p>
        ) : null}
        {decision === "approved" ? (
          <div style={successStyle}>
            <strong>Revision approved and public render updated.</strong>
            {reviewedContext ? (
              <div>
                <Link href={`${reviewedContext.canonicalPath}?actor=${encodeURIComponent(actor ?? "")}`} style={linkStyle}>
                  Open Public Stock Page
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
        {decision === "rejected" ? (
          <div style={errorStyle}>
            <strong>Revision rejected and kept out of the public render.</strong>
            {reviewedContext ? (
              <div>
                <Link href={`${reviewedContext.canonicalPath}?actor=${encodeURIComponent(actor ?? "")}`} style={linkStyle}>
                  Open Public Stock Page
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
        {error ? <p style={errorStyle}>{decodeURIComponent(error)}</p> : null}
      </header>

	      {data.access.mode === "can_review" ? (
	        <>
	          <section style={summaryGridStyle}>
	            <article style={summaryCardStyle}>
	              <strong>Pending Revisions</strong>
	              <div>{data.pendingItems.length}</div>
	            </article>
	            <article style={summaryCardStyle}>
	              <strong>Source Policy Flags</strong>
	              <div>{data.flaggedItemCount}</div>
	            </article>
	          </section>

	          <section style={sectionStyle}>
	            <h2 style={sectionHeadingStyle}>Pending Queue</h2>
	            {data.pendingItems.length === 0 ? (
	              <p style={{ margin: 0 }}>No pending revisions are waiting for review.</p>
	            ) : (
              data.pendingItems.map((item) => (
                <article key={item.revisionId} style={cardStyle}>
	                  <div style={{ display: "grid", gap: "0.4rem" }}>
	                    <strong>{item.summary}</strong>
	                    <div>
	                      {item.title} ({item.market} / {item.ticker})
	                    </div>
	                    <div>
	                      Queue priority: <strong>{item.queuePriority}</strong> / Source policy:{" "}
	                      <span style={policyStatusStyles[item.policyStatus]}>{item.policyStatus}</span>
	                    </div>
	                    <div>Revision ID: {item.revisionId}</div>
	                    <div>Author: {item.authorId}</div>
	                    <div>Created At: {item.createdAt}</div>
	                    <div>Changed Sections: {item.changedSections.join(", ") || "none"}</div>
	                    <div>Citations: {item.citationCount}</div>
	                    {item.reportReasons.length > 0 ? <div>Report reasons: {item.reportReasons.join(", ")}</div> : null}
	                    {item.policyFindings.length > 0 ? (
	                      <ul style={listStyle}>
	                        {item.policyFindings.map((finding) => (
	                          <li key={`${item.revisionId}-${finding}`}>{finding}</li>
	                        ))}
	                      </ul>
	                    ) : null}
	                  </div>
	                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
	                    <Link href={`${item.canonicalPath}/history`} style={linkStyle}>
                      View History
                    </Link>
                    {item.comparePath ? (
                      <Link href={item.comparePath} style={linkStyle}>
                        Preview Diff
                      </Link>
                    ) : null}
                    <Link href={item.canonicalPath} style={linkStyle}>
                      Open Public Stock Page
                    </Link>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <form action={`/api/wiki/review/${item.revisionId}/approve`} method="post">
                      <input type="hidden" name="actor" value={actor ?? ""} />
                      <input type="hidden" name="note" value="approved from moderation queue" />
                      <button type="submit" style={approveButtonStyle}>
                        Approve Revision
                      </button>
                    </form>
                    <form action={`/api/wiki/review/${item.revisionId}/reject`} method="post">
                      <input type="hidden" name="actor" value={actor ?? ""} />
                      <input type="hidden" name="note" value="rejected from moderation queue" />
                      <button type="submit" style={rejectButtonStyle}>
                        Reject Revision
                      </button>
                    </form>
                  </div>
                </article>
              ))
            )}
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>Recent Reputation Events</h2>
            {data.recentEvents.length === 0 ? (
              <p style={{ margin: 0 }}>No reputation events recorded yet.</p>
            ) : (
              <ul style={listStyle}>
                {data.recentEvents.map((event) => (
                  <li key={event.eventId}>
                    <strong>{event.eventType}</strong> delta {event.delta} on {event.refId}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <section style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Demo Access Paths</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href={`/login?returnTo=${encodeURIComponent("/review/mod-queue")}`} style={linkStyle}>
              Continue To Demo Login
            </Link>
            <Link href="/review/mod-queue?actor=member-1" style={linkStyle}>
              View As Member
            </Link>
            <Link href="/review/mod-queue?actor=reviewer-1" style={linkStyle}>
              View As Reviewer
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

function readParam(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const heroStyle = {
  display: "grid",
  gap: "0.75rem",
  padding: "2rem",
  borderRadius: "1.5rem",
  background: "#f8fafc",
  border: "1px solid #cbd5e1"
} as const;

const eyebrowStyle = {
  margin: 0,
  fontSize: "0.9rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase"
} as const;

const titleStyle = {
  margin: 0,
  fontSize: "2.5rem"
} as const;

const descriptionStyle = {
  margin: 0,
  lineHeight: 1.7
} as const;

const sectionStyle = {
  display: "grid",
  gap: "1rem"
} as const;

const sectionHeadingStyle = {
  margin: 0,
  fontSize: "1.4rem"
} as const;

const cardStyle = {
  padding: "1.5rem",
  borderRadius: "1.25rem",
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
  display: "grid",
  gap: "1rem"
} as const;

const listStyle = {
  margin: 0,
  paddingLeft: "1.1rem",
  display: "grid",
  gap: "0.75rem"
} as const;

const summaryCardStyle = {
  padding: "1.25rem",
  borderRadius: "1rem",
  border: "1px solid #cbd5e1",
  backgroundColor: "#f8fafc",
  display: "grid",
  gap: "0.5rem"
} as const;

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem"
} as const;

const linkStyle = {
  color: "#0f172a",
  fontWeight: 700,
  textDecoration: "underline"
} as const;

const policyStatusStyles = {
  clear: {
    color: "#166534",
    fontWeight: 700
  },
  warning: {
    color: "#92400e",
    fontWeight: 700
  },
  flagged: {
    color: "#991b1b",
    fontWeight: 700
  }
} as const;

const approveButtonStyle = {
  border: 0,
  borderRadius: "999px",
  padding: "0.85rem 1.1rem",
  fontWeight: 700,
  backgroundColor: "#166534",
  color: "#fff",
  cursor: "pointer"
} as const;

const rejectButtonStyle = {
  border: 0,
  borderRadius: "999px",
  padding: "0.85rem 1.1rem",
  fontWeight: 700,
  backgroundColor: "#991b1b",
  color: "#fff",
  cursor: "pointer"
} as const;

const successStyle = {
  padding: "1rem 1.25rem",
  borderRadius: "1rem",
  backgroundColor: "#dcfce7",
  color: "#166534",
  display: "grid",
  gap: "0.5rem"
} as const;

const errorStyle = {
  padding: "1rem 1.25rem",
  borderRadius: "1rem",
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  display: "grid",
  gap: "0.5rem"
} as const;
