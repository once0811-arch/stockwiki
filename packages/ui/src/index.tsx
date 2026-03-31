import type { CSSProperties, ReactNode } from "react";

const containerStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 0.75rem",
  borderRadius: "999px",
  backgroundColor: "#0f172a",
  color: "#f8fafc",
  fontSize: "0.875rem",
  fontWeight: 600
};

export function PhaseBadge(props: { children: ReactNode }): ReactNode {
  return <span style={containerStyle}>{props.children}</span>;
}
