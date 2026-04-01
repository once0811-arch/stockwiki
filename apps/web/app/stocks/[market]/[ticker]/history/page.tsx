import Link from "next/link";
import { notFound } from "next/navigation";
import { getStockHistoryPageData } from "../../../../../src/stock-page/get-stock-history-page-data";

interface StockHistoryRouteProps {
  params: Promise<{
    market: string;
    ticker: string;
  }>;
}

export default async function StockHistoryPage(props: StockHistoryRouteProps) {
  const params = await props.params;

  try {
    const data = await getStockHistoryPageData(params);

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
        <Link href={`/stocks/${params.market}/${params.ticker}`} style={linkStyle}>
          Back To Stock Page
        </Link>
        <header style={heroStyle}>
          <p style={eyebrowStyle}>
            {data.profile.market} / {data.profile.ticker}
          </p>
          <h1 style={titleStyle}>Revision History</h1>
          <p style={descriptionStyle}>
            Public readers stay on approved content while latest edits and pending revisions remain visible here.
          </p>
          {data.comparePath ? (
            <Link href={data.comparePath} style={linkStyle}>
              Compare Approved vs Latest
            </Link>
          ) : null}
        </header>
        <section style={listStyle}>
	          {data.history.map((revision) => (
	            <article key={revision.id} style={cardStyle}>
	              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
	                <strong>{revision.summary}</strong>
	                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
	                  <span style={historyStatusStyles[revision.status]}>{revision.status}</span>
	                  <span style={policyStatusStyles[revision.policyStatus]}>{revision.policyStatus}</span>
	                </div>
	              </div>
	              <div>Revision ID: {revision.id}</div>
	              <div>Author: {revision.authorId}</div>
	              <div>Created At: {revision.createdAt}</div>
	              <div>Citations: {revision.citationCount}</div>
	              {revision.reportReasons.length > 0 ? <div>Report reasons: {revision.reportReasons.join(", ")}</div> : null}
	              {revision.findingCount > 0 ? <div>Source policy findings: {revision.findingCount}</div> : null}
	            </article>
	          ))}
	        </section>
      </main>
    );
  } catch {
    notFound();
  }
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

const listStyle = {
  display: "grid",
  gap: "1rem"
} as const;

const cardStyle = {
  padding: "1.5rem",
  borderRadius: "1.25rem",
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
  display: "grid",
  gap: "0.5rem"
} as const;

const historyStatusStyles = {
  approved: {
    color: "#166534",
    fontWeight: 700
  },
  pending: {
    color: "#92400e",
    fontWeight: 700
  },
  rejected: {
    color: "#991b1b",
    fontWeight: 700
  },
  reverted: {
    color: "#1d4ed8",
    fontWeight: 700
  }
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

const linkStyle = {
  color: "#0f172a",
  fontWeight: 700,
  textDecoration: "underline"
} as const;
