import { SearchPageView } from "../../src/search/search-page-view";
import { getSearchPageData } from "../../src/search/search-read-model";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string | string[];
  }>;
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = readParam(searchParams.q);
  const data = getSearchPageData(query);

  return <SearchPageView data={data} />;
}

function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
