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
    findingCount?: string | string[];
    intentId?: string | string[];
    policyStatus?: string | string[];
    reportReasons?: string | string[];
    submitted?: string | string[];
  }>;
}

export default async function StockEditPage(props: StockEditPageRouteProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const actor = readParam(searchParams.actor);
  const error = readParam(searchParams.error);
  const findingCount = Number(readParam(searchParams.findingCount) ?? "0");
  const submitted = readParam(searchParams.submitted) === "1";
  const intentId = readParam(searchParams.intentId);
  const policyStatus = readParam(searchParams.policyStatus);
  const reportReasons = readParam(searchParams.reportReasons)?.split(",").filter(Boolean) ?? [];

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
	            <div style={submittedStateStyles[policyStatus === "flagged" ? "flagged" : policyStatus === "warning" ? "warning" : "clear"]}>
	              <strong>Pending revision submitted for reviewer queue.</strong>
	              <div>
	                {intentId ? `${intentId}. ` : ""}
	                Source policy state: {policyStatus ?? "clear"} with {findingCount} finding
	                {findingCount === 1 ? "" : "s"}.
	              </div>
	              {reportReasons.length > 0 ? <div>Report reasons: {reportReasons.join(", ")}</div> : null}
	            </div>
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
	                <li>Select every section you changed so citation checks know where trust policy applies.</li>
	                <li>Tier 1 or Tier 2 sources should back article claims; Tier 4 sources are reviewer-only warning material.</li>
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
	                <fieldset style={fieldsetStyle}>
	                  <legend style={sectionHeadingStyle}>Citation-Required Sections</legend>
	                  <div style={checkboxGridStyle}>
	                    {data.citationSections.map((section) => (
	                      <label key={section.id} style={checkboxLabelStyle}>
	                        <input name="changedSectionId" type="checkbox" value={section.id} />
	                        <span>
	                          <strong>{section.label}</strong>
	                          <div>{section.description}</div>
	                          <div>
	                            {section.citationRequired ? "Citation required" : "Citation optional"}
	                            {section.contentious ? " / High-risk review" : ""}
	                          </div>
	                        </span>
	                      </label>
	                    ))}
	                  </div>
	                </fieldset>
	                <fieldset style={fieldsetStyle}>
	                  <legend style={sectionHeadingStyle}>Source Tier Guide</legend>
	                  <div style={tierGuideGridStyle}>
	                    {data.sourceTierGuidance.map((tier) => (
	                      <article key={tier.tier} style={tierGuideCardStyle}>
	                        <strong>{tier.label}</strong>
	                        <div>{tier.description}</div>
	                        <div>{tier.articleUsage}</div>
	                      </article>
	                    ))}
	                  </div>
	                </fieldset>
	                <fieldset style={fieldsetStyle}>
	                  <legend style={sectionHeadingStyle}>Citation Helper</legend>
	                  <div style={{ display: "grid", gap: "1rem" }}>
	                    {[1, 2, 3].map((slot) => (
	                      <div key={slot} style={citationCardStyle}>
	                        <strong>Citation {slot}</strong>
	                        <label style={fieldStyle}>
	                          <span>Citation {slot} Label</span>
	                          <input aria-label={`Citation ${slot} Label`} name="citationLabel" style={inputStyle} />
	                        </label>
	                        <label style={fieldStyle}>
	                          <span>Citation {slot} URL</span>
	                          <input aria-label={`Citation ${slot} URL`} name="citationUrl" placeholder="https://..." style={inputStyle} />
	                        </label>
	                        <div style={citationMetaGridStyle}>
	                          <label style={fieldStyle}>
	                            <span>Citation {slot} Tier</span>
	                            <select aria-label={`Citation ${slot} Tier`} defaultValue="" name="citationTier" style={inputStyle}>
	                              <option value="">Select tier</option>
	                              {data.sourceTierGuidance.map((tier) => (
	                                <option key={tier.tier} value={tier.tier}>
	                                  {tier.label}
	                                </option>
	                              ))}
	                            </select>
	                          </label>
	                          <label style={fieldStyle}>
	                            <span>Citation {slot} Published Date</span>
	                            <input aria-label={`Citation ${slot} Published Date`} name="citationPublishedAt" type="date" style={inputStyle} />
	                          </label>
	                        </div>
	                        <label style={fieldStyle}>
	                          <span>Citation {slot} Applies To</span>
	                          <select aria-label={`Citation ${slot} Applies To`} defaultValue="" name="citationSectionId" style={inputStyle}>
	                            <option value="">Select section</option>
	                            {data.citationSections.map((section) => (
	                              <option key={section.id} value={section.id}>
	                                {section.label}
	                              </option>
	                            ))}
	                          </select>
	                        </label>
	                      </div>
	                    ))}
	                  </div>
	                </fieldset>
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

const checkboxGridStyle = {
  display: "grid",
  gap: "0.75rem"
} as const;

const checkboxLabelStyle = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: "0.75rem",
  alignItems: "start",
  padding: "0.85rem 1rem",
  borderRadius: "0.85rem",
  border: "1px solid #cbd5e1",
  backgroundColor: "#f8fafc"
} as const;

const citationCardStyle = {
  display: "grid",
  gap: "0.75rem",
  padding: "1rem",
  borderRadius: "0.85rem",
  border: "1px solid #cbd5e1",
  backgroundColor: "#f8fafc"
} as const;

const citationMetaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "0.75rem"
} as const;

const fieldsetStyle = {
  display: "grid",
  gap: "1rem",
  padding: "1rem",
  borderRadius: "1rem",
  border: "1px solid #cbd5e1"
} as const;

const successStyle = {
  margin: 0,
  color: "#166534",
  fontWeight: 700
} as const;

const submittedStateStyles = {
  clear: {
    ...successStyle,
    padding: "1rem",
    borderRadius: "0.85rem",
    backgroundColor: "#dcfce7"
  },
  warning: {
    margin: 0,
    color: "#92400e",
    fontWeight: 700,
    padding: "1rem",
    borderRadius: "0.85rem",
    backgroundColor: "#fef3c7",
    display: "grid",
    gap: "0.4rem"
  },
  flagged: {
    margin: 0,
    color: "#991b1b",
    fontWeight: 700,
    padding: "1rem",
    borderRadius: "0.85rem",
    backgroundColor: "#fee2e2",
    display: "grid",
    gap: "0.4rem"
  }
} as const;

const errorStyle = {
  margin: 0,
  color: "#991b1b",
  fontWeight: 700
} as const;

const tierGuideCardStyle = {
  padding: "1rem",
  borderRadius: "0.85rem",
  border: "1px solid #cbd5e1",
  backgroundColor: "#f8fafc",
  display: "grid",
  gap: "0.5rem"
} as const;

const tierGuideGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "0.75rem"
} as const;
