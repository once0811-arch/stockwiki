import type { ReactNode } from "react";

export const metadata = {
  title: "StockWiki Phase 0",
  description: "Phase 0 bootstrap surface for StockWiki"
};

export default function RootLayout(props: { children: ReactNode }): ReactNode {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#f8fafc",
          color: "#0f172a"
        }}
      >
        {props.children}
      </body>
    </html>
  );
}
