import { NextResponse } from "next/server";
import { submitWatchlistAdd } from "../../../src/watchlist/watchlist-actions";

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const actor = readString(formData.get("actor"));
  const market = readRequiredString(formData.get("market"));
  const ticker = readRequiredString(formData.get("ticker"));

  try {
    const result = await submitWatchlistAdd({
      actor,
      market,
      ticker
    });

    return NextResponse.redirect(withFeedbackUrl(request.url, result.canonicalPath, actor, "watch_added", undefined), 303);
  } catch (error) {
    const fallbackPath = `/stocks/${market.toLowerCase()}/${ticker.toLowerCase()}`;
    return NextResponse.redirect(withFeedbackUrl(request.url, fallbackPath, actor, undefined, error), 303);
  }
}

function readRequiredString(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Missing required form field");
  }

  return value;
}

function readString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return value;
}

function withFeedbackUrl(
  requestUrl: string,
  path: string,
  actor: string | undefined,
  notice: string | undefined,
  error: unknown
): URL {
  const url = new URL(path, requestUrl);
  if (actor) {
    url.searchParams.set("actor", actor);
  }
  if (notice) {
    url.searchParams.set("notice", notice);
  }
  if (error) {
    url.searchParams.set("error", encodeURIComponent(error instanceof Error ? error.message : "Watchlist action failed"));
  }
  return url;
}
