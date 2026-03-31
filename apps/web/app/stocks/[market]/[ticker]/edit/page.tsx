import Link from "next/link";
import { notFound } from "next/navigation";
import { getStockEditPageData } from "../../../../../src/wiki-edit/get-stock-edit-page-data";

interface StockEditPageRouteProps {
  params: Promise<{
    market: string;
    ticker: string;
  }>;
  searchParams: Promise<{
    actor?: string | string[];
    error?: string | string[];
    intentId?: string | string[];
    submitted?: string | string[];
  }>;
}

export default async function StockEditPage(props: StockEditPageRouteProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const actor = readParam(searchParams.actor);
  const error = readParam(searchParams.error);
  const submitted = readParam(searchParams.submitted) === "1";
  const intentId = readParam(searchParams.intentId);

  try {
    const data = await getStockEditPageData({
      actor,
      market: params.market,
      ticker: params.ticker
    });

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
        <Link href={buildStockPath(params.market, params.ticker, actor)} style={linkStyle}>
          Back To Stock Page
        </Link>

        <header style={heroStyle}>
          <p style={eyebrowStyle}>
            {data.profile.market} / {data.profile.ticker}
          </p>
          <h1 style={titleStyle}>{resolveHeading(data.access.mode)}</h1>
          <p style={descriptionStyle}>{data.access.message}</p>
          {data.session ? (
            <p style={{ margin: 0, color: "#475569" }}>
              Signed in as {data.session.displayName} ({data.session.role})
            </p>
          ) : null}
          {submitted ? (
            <p style={successStyle}>
              Pending revision submitted for reviewer queue.
              {intentId ? ` ${intentId}` : ""}
            </p>
          ) : null}
          {error ? <p style={errorStyle}>{decodeURIComponent(error)}</p> : null}
        </header>

        {data.access.mode === "can_edit" ? (
          <section style={gridStyle}>
            <article style={cardStyle}>
              <h2 style={sectionHeadingStyle}>Editing Rules</h2>
              <ul style={listStyle}>
                <li>Edit summary is required.</li>
                <li>Public readers stay on the approved revision until review.</li>
                <li>Use citations in later slices even though this fake-first flow does not enforce them yet.</li>
              </ul>
              <Link href={data.historyPath} style={linkStyle}>
                View Revision History
              </Link>
            </article>

            <article style={cardStyle}>
              <h2 style={sectionHeadingStyle}>Proposal Form</h2>
              <form action="/api/wiki/edit-intents" method="post" style={{ display: "grid", gap: "1rem" }}>
                <input type="hidden" name="actor" value={actor ?? ""} />
                <input type="hidden" name="market" value={params.market} />
                <input type="hidden" name="ticker" value={params.ticker} />
                <label style={fieldStyle}>
                  <span>Edit Summary</span>
                  <input
                    aria-label="Edit Summary"
                    name="summary"
                    required
                    placeholder="Summarize what changed"
                    style={inputStyle}
                  />
                </label>
                <label style={fieldStyle}>
                  <span>Proposed Content</span>
                  <textarea
                    aria-label="Proposed Content"
                    name="contentMarkdown"
                    required
                    defaultValue={data.prefillContent}
                    rows={10}
                    style={textAreaStyle}
                  />
                </label>
                <button type="submit" style={buttonStyle}>
                  Submit Edit Proposal
                </button>
              </form>
            </article>
          </section>
        ) : (
          <section style={cardStyle}>
            <h2 style={sectionHeadingStyle}>Demo Access Paths</h2>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {data.access.mode === "login_required" ? (
                <Link
                  href={`/login?returnTo=${encodeURIComponent(`/stocks/${params.market}/${params.ticker}/edit`)}`}
                  style={linkStyle}
                >
                  Continue To Demo Login
                </Link>
              ) : null}
              <Link href={`${buildStockPath(params.market, params.ticker)}/edit?actor=member-1`} style={linkStyle}>
                View As Member
              </Link>
              <Link
                href={`${buildStockPath(params.market, params.ticker)}/edit?actor=contributor-1`}
                style={linkStyle}
              >
                View As Contributor
              </Link>
              <Link href={`${buildStockPath(params.market, params.ticker)}/edit?actor=reviewer-1`} style={linkStyle}>
                View As Reviewer
              </Link>
            </div>
          </section>
        )}
      </main>
    );
  } catch {
    notFound();
  }
}

function readParam(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function resolveHeading(mode: string): string {
  switch (mode) {
    case "login_required":
      return "Login Required";
    case "needs_contributor":
      return "Contributor Access Required";
    case "needs_trusted_contributor":
      return "Trusted Contributor Access Required";
    case "needs_reviewer":
      return "Reviewer Access Required";
    default:
      return "Edit Proposal";
  }
}

function buildStockPath(market: string, ticker: string, actor?: string): string {
  const basePath = `/stocks/${market}/${ticker}`;

  if (!actor) {
    return basePath;
  }

  return `${basePath}?actor=${encodeURIComponent(actor)}`;
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

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "1rem"
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

const sectionHeadingStyle = {
  margin: 0,
  fontSize: "1.25rem"
} as const;

const listStyle = {
  margin: 0,
  paddingLeft: "1.1rem",
  display: "grid",
  gap: "0.75rem"
} as const;

const fieldStyle = {
  display: "grid",
  gap: "0.5rem"
} as const;

const inputStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: "0.85rem",
  padding: "0.85rem 1rem",
  backgroundColor: "#fff"
} as const;

const textAreaStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: "0.85rem",
  padding: "1rem",
  backgroundColor: "#fff",
  resize: "vertical"
} as const;

const buttonStyle = {
  border: 0,
  borderRadius: "999px",
  padding: "0.9rem 1.25rem",
  fontWeight: 700,
  backgroundColor: "#0f172a",
  color: "#fff",
  cursor: "pointer"
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
