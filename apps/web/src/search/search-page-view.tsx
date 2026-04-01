import Link from "next/link";
import { PhaseBadge } from "@stockwiki/ui";
import type { SearchPageData, SearchResultItem } from "./search-read-model";

export function SearchPageView(props: { data: SearchPageData }) {
  const { data } = props;

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
      <PhaseBadge>Phase 6 Search Slice</PhaseBadge>

      <section
        style={{
          display: "grid",
          gap: "1rem",
          padding: "2rem",
          borderRadius: "1.5rem",
          background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)"
        }}
      >
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <h1 style={{ margin: 0, fontSize: "3rem", lineHeight: 1 }}>Search</h1>
          <p style={{ margin: 0, maxWidth: "50rem", lineHeight: 1.7 }}>
            Find reviewed stock pages by exact ticker, canonical title, alias, and linked discussion thread title.
          </p>
        </div>

        <form
          action="/search"
          method="get"
          style={{
            display: "grid",
            gap: "0.75rem",
            maxWidth: "38rem"
          }}
        >
          <label htmlFor="search-query" style={{ fontWeight: 600 }}>
            Search Query
          </label>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap"
            }}
          >
            <input
              id="search-query"
              name="q"
              defaultValue={data.query}
              placeholder={data.searchPlaceholder}
              style={{
                flex: "1 1 18rem",
                border: "1px solid #93c5fd",
                borderRadius: "999px",
                padding: "0.9rem 1rem",
                background: "#fff"
              }}
            />
            <button
              type="submit"
              style={{
                border: 0,
                borderRadius: "999px",
                padding: "0.9rem 1.3rem",
                background: "#0f172a",
                color: "#f8fafc",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Search
            </button>
          </div>
        </form>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem"
          }}
        >
          <article style={statusCardStyle}>
            <h2 style={statusHeadingStyle}>Index Lag</h2>
            <p style={statusBodyStyle}>
              {data.indexSync.lag.pendingEventCount} pending event{data.indexSync.lag.pendingEventCount === 1 ? "" : "s"} /{" "}
              {data.indexSync.lag.lagMinutes} min lag / {data.indexSync.lag.status}
            </p>
          </article>
          <article style={statusCardStyle}>
            <h2 style={statusHeadingStyle}>Indexed Pages</h2>
            <p style={statusBodyStyle}>{data.indexSync.indexedPageCount} page key{data.indexSync.indexedPageCount === 1 ? "" : "s"}</p>
          </article>
          <article style={statusCardStyle}>
            <h2 style={statusHeadingStyle}>Handled Events</h2>
            <p style={statusBodyStyle}>{data.indexSync.handledEventKinds.join(" / ")}</p>
          </article>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gap: "1rem"
        }}
      >
        <article style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Autocomplete</h2>
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>
            Alias-aware suggestions stay fake-first but lock the query contract before a real OpenSearch adapter arrives.
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.1rem",
              display: "grid",
              gap: "0.75rem"
            }}
          >
            {data.autocomplete.map((item) => (
              <li key={`${item.kind}:${item.value}`}>
                <Link href={`/search?q=${encodeURIComponent(item.value)}`} style={linkStyle}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </article>

        {data.query ? (
          <article style={cardStyle}>
            <h2 style={sectionHeadingStyle}>Results</h2>
            <p style={{ margin: 0, color: "#475569" }}>
              {data.totalResultCount} result{data.totalResultCount === 1 ? "" : "s"} for <strong>{data.query}</strong>
            </p>
            {data.groups.length === 0 ? <p style={{ margin: 0 }}>{data.emptyStateMessage}</p> : null}
          </article>
        ) : (
          <article style={cardStyle}>
            <h2 style={sectionHeadingStyle}>Ready Queries</h2>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>{data.emptyStateMessage}</p>
          </article>
        )}

        {data.groups.map((group) => (
          <article key={group.id} style={cardStyle}>
            <h2 style={sectionHeadingStyle}>{group.label}</h2>
            <div style={{ display: "grid", gap: "0.9rem" }}>
              {group.items.map((item) => (
                <SearchResultCard key={item.id} item={item} />
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function SearchResultCard(props: { item: SearchResultItem }) {
  const { item } = props;

  return (
    <article
      style={{
        display: "grid",
        gap: "0.5rem",
        padding: "1rem 1.1rem",
        borderRadius: "1rem",
        border: "1px solid #e2e8f0",
        background: "#f8fafc"
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={matchBadgeStyle}>{item.matchLabel}</span>
        <span style={stateBadgeStyle}>{item.pageStateLabel}</span>
        {item.ticker ? <span style={{ color: "#475569", fontSize: "0.9rem" }}>{item.ticker}</span> : null}
      </div>
      <Link href={item.canonicalPath} style={{ ...linkStyle, fontSize: "1.1rem" }}>
        {item.title}
      </Link>
      <p style={{ margin: 0, lineHeight: 1.7 }}>{item.summary}</p>
      <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>Matched on {item.matchedText}</p>
      {item.aliases.length > 0 ? (
        <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>Aliases: {item.aliases.join(", ")}</p>
      ) : null}
    </article>
  );
}

const cardStyle = {
  display: "grid",
  gap: "1rem",
  padding: "1.5rem",
  borderRadius: "1.5rem",
  background: "#ffffff",
  border: "1px solid #e2e8f0"
} as const;

const statusCardStyle = {
  display: "grid",
  gap: "0.4rem",
  padding: "1rem 1.1rem",
  borderRadius: "1rem",
  background: "rgba(255, 255, 255, 0.85)"
} as const;

const sectionHeadingStyle = {
  margin: 0,
  fontSize: "1.3rem"
} as const;

const statusHeadingStyle = {
  margin: 0,
  fontSize: "0.95rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em"
} as const;

const statusBodyStyle = {
  margin: 0,
  lineHeight: 1.6
} as const;

const matchBadgeStyle = {
  display: "inline-flex",
  padding: "0.2rem 0.55rem",
  borderRadius: "999px",
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: "0.82rem",
  fontWeight: 700
} as const;

const stateBadgeStyle = {
  display: "inline-flex",
  padding: "0.2rem 0.55rem",
  borderRadius: "999px",
  background: "#e2e8f0",
  color: "#0f172a",
  fontSize: "0.82rem",
  fontWeight: 700
} as const;

const linkStyle = {
  color: "#0f172a",
  fontWeight: 700,
  textDecoration: "none"
} as const;
