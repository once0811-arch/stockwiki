import { getSearchPageData } from "../../../../src/search/search-read-model";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? undefined;

  return Response.json(getSearchPageData(query));
}
