import type { Metadata } from "next";

interface StockMetadataInput {
  canonicalPath?: string;
  indexable: boolean;
  name: string;
  ticker: string;
}

export function buildStockMetadata(input: StockMetadataInput): Metadata {
  return {
    title: `${input.name} (${input.ticker}) | StockWiki`,
    description: `StockWiki read-only stock page for ${input.name}.`,
    alternates: input.canonicalPath
      ? {
          canonical: input.canonicalPath
        }
      : undefined,
    robots: {
      index: input.indexable,
      follow: input.indexable
    }
  };
}
