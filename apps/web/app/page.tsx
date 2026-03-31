import { PhaseBadge } from "@stockwiki/ui";

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: "48rem",
        margin: "0 auto",
        padding: "4rem 1.5rem",
        display: "grid",
        gap: "1rem"
      }}
    >
      <PhaseBadge>Phase 0 Bootstrap</PhaseBadge>
      <h1 style={{ margin: 0, fontSize: "2.5rem" }}>StockWiki harness is ready for the first vertical slice.</h1>
      <p style={{ margin: 0, lineHeight: 1.6 }}>
        This page exists only to prove the Next.js workspace, shared UI package, and health routes are wired before
        Phase 1 work begins.
      </p>
    </main>
  );
}
