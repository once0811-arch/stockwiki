import type { ReactNode } from "react";

export const metadata = {
  title: "StockWiki",
  description: "Fake-first stock knowledge surfaces and review workflows for StockWiki."
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
