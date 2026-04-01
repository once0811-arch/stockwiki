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
  searchParams: Promise<{
    actor?: string | string[];
    error?: string | string[];
    notice?: string | string[];
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
  const searchParams = await props.searchParams;
  const actor = Array.isArray(searchParams.actor) ? searchParams.actor[0] : searchParams.actor;
  const notice = Array.isArray(searchParams.notice) ? searchParams.notice[0] : searchParams.notice;
  const error = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error;

  try {
    const data = await getStockPageData(params, actor);
    return <StockPageView data={data} error={error} notice={notice} />;
  } catch {
    notFound();
  }
}
