import { NextResponse } from "next/server";
import { submitWatchlistRemove } from "../../../../src/watchlist/watchlist-actions";

interface WatchlistRouteProps {
  params: Promise<{
    watchId: string;
  }>;
}

export async function POST(request: Request, props: WatchlistRouteProps): Promise<NextResponse> {
  const params = await props.params;
  const formData = await request.formData();
  const actor = readString(formData.get("actor"));
  const returnTo = readString(formData.get("returnTo"));

  try {
    const result = await submitWatchlistRemove({
      actor,
      returnTo,
      watchId: params.watchId
    });

    return NextResponse.redirect(withFeedbackUrl(request.url, result.redirectPath, actor, "watch_removed", undefined), 303);
  } catch (error) {
    const fallbackPath = returnTo ?? "/me/watchlist";
    return NextResponse.redirect(withFeedbackUrl(request.url, fallbackPath, actor, undefined, error), 303);
  }
}

export async function DELETE(request: Request, props: WatchlistRouteProps): Promise<Response> {
  const params = await props.params;
  const url = new URL(request.url);

  const result = await submitWatchlistRemove({
    actor: url.searchParams.get("actor") ?? undefined,
    returnTo: url.searchParams.get("returnTo") ?? undefined,
    watchId: params.watchId
  });

  return Response.json({
    ok: true,
    redirectPath: result.redirectPath
  });
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
