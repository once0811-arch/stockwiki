import Link from "next/link";
import { notFound } from "next/navigation";
import {
  discussionReportReasonOptions,
  getStockDiscussionPageData
} from "../../../../../src/discussion/discussion-read-model";

interface StockDiscussionRouteProps {
  params: Promise<{
    market: string;
    ticker: string;
  }>;
  searchParams: Promise<{
    actor?: string | string[];
    error?: string | string[];
    notice?: string | string[];
  }>;
}

export default async function StockDiscussionPage(props: StockDiscussionRouteProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const actor = readParam(searchParams.actor);
  const error = readParam(searchParams.error);
  const notice = readParam(searchParams.notice);

  try {
    const data = await getStockDiscussionPageData({
      actor,
      market: params.market,
      ticker: params.ticker
    });

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
        <Link href={data.stockPath} style={linkStyle}>
          Back To Stock Page
        </Link>

        <header style={heroStyle}>
          <p style={eyebrowStyle}>
            {data.profile.market} / {data.profile.ticker}
          </p>
          <h1 style={titleStyle}>Discussion</h1>
          <p style={descriptionStyle}>
            Article text stays citation-first while interpretation, trade-offs, and reviewer notes can live here.
          </p>
          {data.session ? (
            <p style={{ margin: 0, color: "#475569" }}>
              Signed in as {data.session.displayName} ({data.session.role})
            </p>
          ) : null}
          <p style={{ margin: 0, color: "#475569" }}>{data.access.message}</p>
          {notice ? <p style={successStyle}>{resolveNotice(notice)}</p> : null}
          {error ? <p style={errorStyle}>{decodeURIComponent(error)}</p> : null}
        </header>

        <section style={summaryGridStyle}>
          <article style={summaryCardStyle}>
            <strong>Total Threads</strong>
            <div>{data.moderationSummary.threadCount}</div>
          </article>
          <article style={summaryCardStyle}>
            <strong>Open Threads</strong>
            <div>{data.moderationSummary.openThreadCount}</div>
          </article>
          <article style={summaryCardStyle}>
            <strong>Reported Comments</strong>
            <div>{data.moderationSummary.reportedCommentCount}</div>
          </article>
          <article style={summaryCardStyle}>
            <strong>Locked / Resolved</strong>
            <div>
              {data.moderationSummary.lockedThreadCount} / {data.moderationSummary.resolvedThreadCount}
            </div>
          </article>
        </section>

        {data.access.canParticipate ? (
          <section style={cardStyle}>
            <h2 style={sectionHeadingStyle}>Start A Thread</h2>
            <form action="/api/discussions/threads" method="post" style={{ display: "grid", gap: "1rem" }}>
              <input type="hidden" name="actor" value={actor ?? ""} />
              <input type="hidden" name="market" value={params.market} />
              <input type="hidden" name="ticker" value={params.ticker} />
              <label style={fieldStyle}>
                <span>Thread Title</span>
                <input aria-label="Thread Title" name="title" required style={inputStyle} />
              </label>
              <label style={fieldStyle}>
                <span>Linked Section</span>
                <select aria-label="Linked Section" defaultValue="" name="sectionAnchor" style={inputStyle}>
                  <option value="">General discussion</option>
                  {data.sectionOptions.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </label>
              <label style={fieldStyle}>
                <span>Opening Comment</span>
                <textarea aria-label="Opening Comment" name="bodyMarkdown" required rows={5} style={textAreaStyle} />
              </label>
              <button type="submit" style={buttonStyle}>
                Create Thread
              </button>
            </form>
          </section>
        ) : (
          <section style={cardStyle}>
            <h2 style={sectionHeadingStyle}>Discussion Access</h2>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href={`/login?returnTo=${encodeURIComponent(`/stocks/${params.market}/${params.ticker}/discussion`)}`} style={linkStyle}>
                Continue To Demo Login
              </Link>
              <Link href={`/stocks/${params.market}/${params.ticker}/discussion?actor=member-1`} style={linkStyle}>
                View As Member
              </Link>
              <Link href={`/stocks/${params.market}/${params.ticker}/discussion?actor=reviewer-1`} style={linkStyle}>
                View As Reviewer
              </Link>
            </div>
          </section>
        )}

        <section style={{ display: "grid", gap: "1rem" }}>
          <h2 style={sectionHeadingStyle}>Threads</h2>
          {data.threads.length === 0 ? (
            <article style={cardStyle}>No discussion threads exist yet.</article>
          ) : (
            data.threads.map((thread) => (
              <article key={thread.id} id={thread.id} style={cardStyle}>
                <header style={{ display: "grid", gap: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{thread.title}</h3>
                    {thread.isPinned ? <span style={pinnedStyle}>Pinned</span> : null}
                    <span style={threadStatusStyles[thread.status]}>{thread.status}</span>
                  </div>
                  <div style={{ color: "#475569" }}>
                    Started by {thread.createdBy} at {thread.createdAt}
                  </div>
                  <div style={{ color: "#475569" }}>
                    {thread.sectionLabel ? `Linked section: ${thread.sectionLabel}` : "General discussion"} / {thread.commentCount} comment
                    {thread.commentCount === 1 ? "" : "s"} / latest activity {thread.latestActivityAt}
                  </div>
                </header>

                {data.access.canModerate ? (
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <form action={`/api/discussions/threads/${thread.id}/pin`} method="post">
                      <input type="hidden" name="actor" value={actor ?? ""} />
                      <input type="hidden" name="market" value={params.market} />
                      <input type="hidden" name="ticker" value={params.ticker} />
                      <input type="hidden" name="pinned" value={thread.isPinned ? "0" : "1"} />
                      <button type="submit" style={secondaryButtonStyle}>
                        {thread.isPinned ? "Unpin Thread" : "Pin Thread"}
                      </button>
                    </form>
                    <form action={`/api/discussions/threads/${thread.id}/lock`} method="post">
                      <input type="hidden" name="actor" value={actor ?? ""} />
                      <input type="hidden" name="market" value={params.market} />
                      <input type="hidden" name="ticker" value={params.ticker} />
                      <input type="hidden" name="locked" value={thread.status === "locked" ? "0" : "1"} />
                      <button type="submit" style={secondaryButtonStyle}>
                        {thread.status === "locked" ? "Unlock Thread" : "Lock Thread"}
                      </button>
                    </form>
                  </div>
                ) : null}

                <div style={{ display: "grid", gap: "1rem" }}>
                  {thread.rootComments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      actor={actor}
                      canModerate={data.access.canModerate}
                      canParticipate={data.access.canParticipate}
                      comment={comment}
                      market={params.market}
                      reportReasonOptions={discussionReportReasonOptions}
                      thread={thread}
                      ticker={params.ticker}
                    />
                  ))}
                </div>

                {data.access.canParticipate && (thread.canReply || data.access.canModerate) ? (
                  <form action="/api/discussions/comments" method="post" style={replyFormStyle}>
                    <input type="hidden" name="actor" value={actor ?? ""} />
                    <input type="hidden" name="market" value={params.market} />
                    <input type="hidden" name="ticker" value={params.ticker} />
                    <input type="hidden" name="threadId" value={thread.id} />
                    <label style={fieldStyle}>
                      <span>Add Comment</span>
                      <textarea
                        aria-label={`Add Comment ${thread.id}`}
                        name="bodyMarkdown"
                        required
                        rows={4}
                        style={textAreaStyle}
                      />
                    </label>
                    <button type="submit" style={buttonStyle}>
                      Post Comment
                    </button>
                  </form>
                ) : null}
              </article>
            ))
          )}
        </section>
      </main>
    );
  } catch {
    notFound();
  }
}

function CommentCard(props: {
  actor?: string;
  canModerate: boolean;
  canParticipate: boolean;
  comment: {
    authorId: string;
    bodyHtml: string;
    createdAt: string;
    helpfulCount: number;
    id: string;
    reportCount: number;
    replies: Array<{
      authorId: string;
      bodyHtml: string;
      createdAt: string;
      helpfulCount: number;
      id: string;
      reportCount: number;
      status: string;
      userHasHelpfulVote: boolean;
    }>;
    status: string;
    userHasHelpfulVote: boolean;
  };
  market: string;
  reportReasonOptions: Array<{ description: string; reason: string }>;
  thread: {
    canReply: boolean;
    id: string;
    status: string;
  };
  ticker: string;
}) {
  return (
    <article id={props.comment.id} style={commentCardStyle}>
      <div style={{ display: "grid", gap: "0.4rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <strong>{props.comment.authorId}</strong>
          <span style={commentStatusStyles[props.comment.status === "reported" ? "reported" : "visible"]}>
            {props.comment.status}
          </span>
        </div>
        <div dangerouslySetInnerHTML={{ __html: props.comment.bodyHtml }} style={{ lineHeight: 1.7 }} />
        <div style={{ color: "#475569" }}>
          {props.comment.createdAt} / Helpful {props.comment.helpfulCount} / Reports {props.comment.reportCount}
        </div>
      </div>

      {props.canParticipate ? (
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <form action={`/api/discussions/comments/${props.comment.id}/helpful`} method="post">
            <input type="hidden" name="actor" value={props.actor ?? ""} />
            <input type="hidden" name="market" value={props.market} />
            <input type="hidden" name="ticker" value={props.ticker} />
            <button type="submit" style={secondaryButtonStyle}>
              {props.comment.userHasHelpfulVote ? "Remove Helpful" : "Mark Helpful"}
            </button>
          </form>
          <form action={`/api/discussions/comments/${props.comment.id}/report`} method="post" style={inlineFormStyle}>
            <input type="hidden" name="actor" value={props.actor ?? ""} />
            <input type="hidden" name="market" value={props.market} />
            <input type="hidden" name="ticker" value={props.ticker} />
            <select aria-label={`Report Reason ${props.comment.id}`} defaultValue="misinformation" name="reason" style={smallInputStyle}>
              {props.reportReasonOptions.map((reason) => (
                <option key={reason.reason} value={reason.reason}>
                  {reason.reason}
                </option>
              ))}
            </select>
            <button type="submit" style={secondaryButtonStyle}>
              Report Comment
            </button>
          </form>
        </div>
      ) : null}

      {props.comment.replies.length > 0 ? (
        <div style={replyListStyle}>
          {props.comment.replies.map((reply) => (
            <article key={reply.id} id={reply.id} style={replyCardStyle}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <strong>{reply.authorId}</strong>
                <span style={commentStatusStyles[reply.status === "reported" ? "reported" : "visible"]}>{reply.status}</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: reply.bodyHtml }} style={{ lineHeight: 1.7 }} />
              <div style={{ color: "#475569" }}>
                {reply.createdAt} / Helpful {reply.helpfulCount} / Reports {reply.reportCount}
              </div>
              {props.canParticipate ? (
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <form action={`/api/discussions/comments/${reply.id}/helpful`} method="post">
                    <input type="hidden" name="actor" value={props.actor ?? ""} />
                    <input type="hidden" name="market" value={props.market} />
                    <input type="hidden" name="ticker" value={props.ticker} />
                    <button type="submit" style={secondaryButtonStyle}>
                      {reply.userHasHelpfulVote ? "Remove Helpful" : "Mark Helpful"}
                    </button>
                  </form>
                  <form action={`/api/discussions/comments/${reply.id}/report`} method="post" style={inlineFormStyle}>
                    <input type="hidden" name="actor" value={props.actor ?? ""} />
                    <input type="hidden" name="market" value={props.market} />
                    <input type="hidden" name="ticker" value={props.ticker} />
                    <select aria-label={`Report Reason ${reply.id}`} defaultValue="misinformation" name="reason" style={smallInputStyle}>
                      {props.reportReasonOptions.map((reason) => (
                        <option key={reason.reason} value={reason.reason}>
                          {reason.reason}
                        </option>
                      ))}
                    </select>
                    <button type="submit" style={secondaryButtonStyle}>
                      Report Comment
                    </button>
                  </form>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      {props.canParticipate && (props.thread.canReply || props.canModerate) ? (
        <form action="/api/discussions/comments" method="post" style={replyFormStyle}>
          <input type="hidden" name="actor" value={props.actor ?? ""} />
          <input type="hidden" name="market" value={props.market} />
          <input type="hidden" name="ticker" value={props.ticker} />
          <input type="hidden" name="threadId" value={props.thread.id} />
          <input type="hidden" name="parentCommentId" value={props.comment.id} />
          <label style={fieldStyle}>
            <span>Reply</span>
            <textarea aria-label={`Reply ${props.comment.id}`} name="bodyMarkdown" required rows={3} style={textAreaStyle} />
          </label>
          <button type="submit" style={secondaryButtonStyle}>
            Post Reply
          </button>
        </form>
      ) : null}
    </article>
  );
}

function resolveNotice(notice: string): string {
  switch (notice) {
    case "thread_created":
      return "Discussion thread created.";
    case "comment_added":
      return "Comment posted to the thread.";
    case "helpful_updated":
      return "Helpful vote updated.";
    case "comment_reported":
      return "Comment report submitted.";
    case "thread_pinned":
      return "Thread pin state updated.";
    case "thread_locked":
      return "Thread lock state updated.";
    default:
      return notice.replaceAll("_", " ");
  }
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

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem"
} as const;

const summaryCardStyle = {
  padding: "1.25rem",
  borderRadius: "1rem",
  border: "1px solid #cbd5e1",
  backgroundColor: "#f8fafc",
  display: "grid",
  gap: "0.5rem"
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

const commentCardStyle = {
  padding: "1rem",
  borderRadius: "1rem",
  border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  display: "grid",
  gap: "0.75rem"
} as const;

const replyCardStyle = {
  padding: "0.9rem 1rem",
  borderRadius: "0.9rem",
  border: "1px solid #e2e8f0",
  backgroundColor: "#ffffff",
  display: "grid",
  gap: "0.5rem"
} as const;

const replyListStyle = {
  display: "grid",
  gap: "0.75rem",
  paddingLeft: "1rem",
  borderLeft: "2px solid #cbd5e1"
} as const;

const replyFormStyle = {
  display: "grid",
  gap: "0.75rem",
  padding: "1rem",
  borderRadius: "1rem",
  border: "1px solid #cbd5e1",
  backgroundColor: "#f8fafc"
} as const;

const sectionHeadingStyle = {
  margin: 0,
  fontSize: "1.3rem"
} as const;

const fieldStyle = {
  display: "grid",
  gap: "0.5rem"
} as const;

const inputStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: "0.85rem",
  padding: "0.85rem 1rem",
  font: "inherit"
} as const;

const smallInputStyle = {
  ...inputStyle,
  padding: "0.6rem 0.75rem"
} as const;

const textAreaStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: "0.85rem",
  padding: "0.85rem 1rem",
  font: "inherit",
  minHeight: "8rem"
} as const;

const buttonStyle = {
  padding: "0.9rem 1.2rem",
  border: "none",
  borderRadius: "999px",
  backgroundColor: "#0f172a",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer"
} as const;

const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#e2e8f0",
  color: "#0f172a"
} as const;

const inlineFormStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  alignItems: "center"
} as const;

const linkStyle = {
  color: "#0f172a",
  fontWeight: 700,
  textDecoration: "underline"
} as const;

const successStyle = {
  margin: 0,
  color: "#166534",
  fontWeight: 700
} as const;

const errorStyle = {
  margin: 0,
  color: "#991b1b",
  fontWeight: 700
} as const;

const pinnedStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.2rem 0.65rem",
  borderRadius: "999px",
  backgroundColor: "#dbeafe",
  color: "#1d4ed8",
  fontWeight: 700
} as const;

const threadStatusStyles = {
  open: {
    color: "#166534",
    fontWeight: 700
  },
  resolved: {
    color: "#1d4ed8",
    fontWeight: 700
  },
  locked: {
    color: "#92400e",
    fontWeight: 700
  }
} as const;

const commentStatusStyles = {
  visible: {
    color: "#166534",
    fontWeight: 700
  },
  reported: {
    color: "#991b1b",
    fontWeight: 700
  }
} as const;
