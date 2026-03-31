import Link from "next/link";
import { notFound } from "next/navigation";
import { getStockDiffPageData } from "../../../../../../src/stock-page/get-stock-diff-page-data";

interface StockDiffRouteProps {
  params: Promise<{
    comparison: string;
    market: string;
    ticker: string;
  }>;
}

export default async function StockDiffPage(props: StockDiffRouteProps) {
  const params = await props.params;

  try {
    const data = await getStockDiffPageData(params, params.comparison);

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
        <Link href={`/stocks/${params.market}/${params.ticker}/history`} style={linkStyle}>
          Back To Revision History
        </Link>
        <header style={heroStyle}>
          <p style={eyebrowStyle}>
            {data.profile.market} / {data.profile.ticker}
          </p>
          <h1 style={titleStyle}>Revision Diff</h1>
          <p style={descriptionStyle}>{data.diff.summary}</p>
        </header>
        <section style={gridStyle}>
          <article style={cardStyle}>
            <h2 style={headingStyle}>From {data.fromRevision.id}</h2>
            <strong>{data.fromRevision.summary}</strong>
            <pre style={preStyle}>{data.fromRevision.contentMarkdown}</pre>
          </article>
          <article style={cardStyle}>
            <h2 style={headingStyle}>To {data.toRevision.id}</h2>
            <strong>{data.toRevision.summary}</strong>
            <pre style={preStyle}>{data.toRevision.contentMarkdown}</pre>
          </article>
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
  gap: "0.75rem"
} as const;

const headingStyle = {
  margin: 0,
  fontSize: "1.25rem"
} as const;

const preStyle = {
  margin: 0,
  padding: "1rem",
  borderRadius: "0.75rem",
  backgroundColor: "#e2e8f0",
  whiteSpace: "pre-wrap"
} as const;

const linkStyle = {
  color: "#0f172a",
  fontWeight: 700,
  textDecoration: "underline"
} as const;
