import Link from "next/link";

interface LoginPageRouteProps {
  searchParams: Promise<{
    returnTo?: string | string[];
  }>;
}

export default async function LoginPage(props: LoginPageRouteProps) {
  const searchParams = await props.searchParams;
  const returnTo = readParam(searchParams.returnTo) ?? "/stocks/krx/005930/edit";

  return (
    <main
      style={{
        maxWidth: "48rem",
        margin: "0 auto",
        padding: "4rem 1.5rem 5rem",
        display: "grid",
        gap: "1.5rem"
      }}
    >
      <header style={heroStyle}>
        <p style={eyebrowStyle}>Fake-First Auth</p>
        <h1 style={titleStyle}>Demo Login</h1>
        <p style={descriptionStyle}>
          Phase 3 closes with a fake session harness. Choose a demo role to continue the edit and review workflow.
        </p>
      </header>

      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Choose A Demo Session</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href={appendActor(returnTo, "member-1")} style={linkStyle}>
            Continue As Member
          </Link>
          <Link href={appendActor(returnTo, "contributor-1")} style={linkStyle}>
            Continue As Contributor
          </Link>
          <Link href={appendActor(returnTo, "reviewer-1")} style={linkStyle}>
            Continue As Reviewer
          </Link>
        </div>
      </section>
    </main>
  );
}

function appendActor(path: string, actor: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}actor=${encodeURIComponent(actor)}`;
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

const linkStyle = {
  color: "#0f172a",
  fontWeight: 700,
  textDecoration: "underline"
} as const;
