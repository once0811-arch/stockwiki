import { PhaseBadge } from "@stockwiki/ui";
import type { StockPageData } from "./get-stock-page-data";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function StockPageView(props: { data: StockPageData }) {
  const { data } = props;

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
      <PhaseBadge>Phase 1 Read-Only Slice</PhaseBadge>

      <header
        style={{
          display: "grid",
          gap: "0.75rem",
          padding: "2rem",
          borderRadius: "1.5rem",
          background: "linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%)"
        }}
      >
        <p style={{ margin: 0, fontSize: "0.9rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {data.profile.market} / {data.profile.ticker}
        </p>
        <h1 style={{ margin: 0, fontSize: "3rem", lineHeight: 1 }}>{data.profile.name}</h1>
        <p style={{ margin: 0, maxWidth: "46rem", lineHeight: 1.7 }}>{data.profile.summary}</p>
        <div style={{ display: "grid", gap: "0.5rem", maxWidth: "40rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <span role="status" style={statusBadgeStyles[data.pageState]}>
              {data.pageStateLabel}
            </span>
            <span style={{ color: "#334155", fontSize: "0.95rem" }}>{data.pageStateSummary}</span>
          </div>
        </div>
        <label style={{ display: "grid", gap: "0.5rem", maxWidth: "26rem" }}>
          <span style={{ fontWeight: 600 }}>Search placeholder</span>
          <input
            readOnly
            value=""
            placeholder={data.searchPlaceholder}
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: "999px",
              padding: "0.85rem 1rem",
              backgroundColor: "#fff"
            }}
          />
        </label>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem"
        }}
      >
        <article style={cardStyle}>
          <h2 style={headingStyle}>System Data</h2>
          <dl style={dlStyle}>
            <div>
              <dt>Price</dt>
              <dd>{formatCurrency(data.quote.price)} KRW</dd>
            </div>
            <div>
              <dt>Change</dt>
              <dd>
                {formatCurrency(data.quote.change)} KRW ({formatPercent(data.quote.changePct)})
              </dd>
            </div>
            <div>
              <dt>Market Cap</dt>
              <dd>{formatCurrency(data.quote.marketCap)} KRW</dd>
            </div>
            <div>
              <dt>Sector</dt>
              <dd>{data.profile.sector}</dd>
            </div>
            <div>
              <dt>Industry</dt>
              <dd>{data.profile.industry}</dd>
            </div>
          </dl>
        </article>

        <article style={cardStyle}>
          <h2 style={headingStyle}>Approved Wiki</h2>
          <div dangerouslySetInnerHTML={{ __html: data.wiki.html }} style={{ lineHeight: 1.7 }} />
        </article>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem"
        }}
      >
        <article style={cardStyle}>
          <h2 style={headingStyle}>Discussion Preview</h2>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: "0.85rem" }}>
            {data.discussionPreview.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <div>{item.summary}</div>
                <div>{item.replies} replies</div>
              </li>
            ))}
          </ul>
        </article>

        <article style={cardStyle}>
          <h2 style={headingStyle}>Recent Filings</h2>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: "0.85rem" }}>
            {data.filings.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <div>{item.filedAt.slice(0, 10)}</div>
              </li>
            ))}
          </ul>
        </article>

        <article style={cardStyle}>
          <h2 style={headingStyle}>Corporate Actions</h2>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: "0.85rem" }}>
            {data.corporateActions.map((item) => (
              <li key={item.id}>
                <strong>{item.actionType}</strong>
                <div>{item.summary}</div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

const cardStyle = {
  padding: "1.5rem",
  borderRadius: "1.25rem",
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)"
} as const;

const headingStyle = {
  marginTop: 0,
  marginBottom: "1rem",
  fontSize: "1.25rem"
} as const;

const badgeBaseStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.35rem 0.7rem",
  borderRadius: "999px",
  fontSize: "0.8rem",
  fontWeight: 700,
  letterSpacing: "0.02em"
} as const;

const statusBadgeStyles = {
  reviewed: {
    ...badgeBaseStyle,
    backgroundColor: "#dcfce7",
    color: "#166534"
  },
  stale: {
    ...badgeBaseStyle,
    backgroundColor: "#fef3c7",
    color: "#92400e"
  },
  noindex: {
    ...badgeBaseStyle,
    backgroundColor: "#fee2e2",
    color: "#991b1b"
  }
} as const;

const dlStyle = {
  margin: 0,
  display: "grid",
  gap: "0.85rem"
} as const;
