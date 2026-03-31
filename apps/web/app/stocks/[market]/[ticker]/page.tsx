import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildStockMetadata } from "../../../../src/stock-page/build-stock-metadata";
import { getStockPageData } from "../../../../src/stock-page/get-stock-page-data";
import { StockPageView } from "../../../../src/stock-page/stock-page-view";

interface StockPageRouteProps {
  params: Promise<{
    market: string;
    ticker: string;
  }>;
}

export async function generateMetadata(props: StockPageRouteProps): Promise<Metadata> {
  const params = await props.params;
  try {
    const data = await getStockPageData(params);

    return buildStockMetadata({
      canonicalPath: data.canonicalPath,
      indexable: data.indexable,
      name: data.profile.name,
      ticker: data.profile.ticker
    });
  } catch {
    return buildStockMetadata({
      indexable: false,
      name: "Unknown Stock",
      ticker: `${params.market.toUpperCase()}:${params.ticker.toUpperCase()}`
    });
  }
}

export default async function StockPage(props: StockPageRouteProps) {
  const params = await props.params;

  try {
    const data = await getStockPageData(params);
    return <StockPageView data={data} />;
  } catch {
    notFound();
  }
}
