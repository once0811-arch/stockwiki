import { getWatchlistPageData } from "../../../src/watchlist/watchlist-read-model";
import { WatchlistPageView } from "../../../src/watchlist/watchlist-page-view";

interface WatchlistPageRouteProps {
  searchParams: Promise<{
    actor?: string | string[];
    error?: string | string[];
    notice?: string | string[];
  }>;
}

export default async function WatchlistPage(props: WatchlistPageRouteProps) {
  const searchParams = await props.searchParams;
  const actor = readParam(searchParams.actor);
  const notice = readParam(searchParams.notice);
  const error = readParam(searchParams.error);
  const data = await getWatchlistPageData({
    actor
  });

  return <WatchlistPageView actor={actor} data={data} error={error} notice={notice} />;
}

function readParam(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
