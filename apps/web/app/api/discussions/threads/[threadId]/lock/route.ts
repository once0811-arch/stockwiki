import { NextResponse } from "next/server";
import { submitThreadLockToggle } from "../../../../../../src/discussion/discussion-actions";

interface ThreadLockRouteProps {
  params: Promise<{
    threadId: string;
  }>;
}

export async function POST(request: Request, props: ThreadLockRouteProps): Promise<NextResponse> {
  const params = await props.params;
  const formData = await request.formData();
  const actor = readString(formData.get("actor"));
  const market = readRequiredString(formData.get("market"));
  const ticker = readRequiredString(formData.get("ticker"));

  try {
    const result = await submitThreadLockToggle({
      actor,
      locked: readRequiredString(formData.get("locked")) === "1",
      market,
      threadId: params.threadId,
      ticker
    });

    return NextResponse.redirect(withFeedbackUrl(request.url, result.canonicalPath, actor, "thread_locked", undefined, params.threadId), 303);
  } catch (error) {
    const fallbackPath = `/stocks/${market.toLowerCase()}/${ticker.toLowerCase()}/discussion`;
    return NextResponse.redirect(withFeedbackUrl(request.url, fallbackPath, actor, undefined, error, params.threadId), 303);
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
  error: unknown,
  hash: string | undefined
): URL {
  const url = new URL(path, requestUrl);
  if (actor) {
    url.searchParams.set("actor", actor);
  }
  if (notice) {
    url.searchParams.set("notice", notice);
  }
  if (error) {
    url.searchParams.set("error", encodeURIComponent(error instanceof Error ? error.message : "Discussion action failed"));
  }
  if (hash) {
    url.hash = hash;
  }
  return url;
}
