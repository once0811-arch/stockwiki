import { NextResponse } from "next/server";
import { submitDiscussionThread } from "../../../../src/discussion/discussion-actions";

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const actor = readString(formData.get("actor"));
  const market = readRequiredString(formData.get("market"));
  const ticker = readRequiredString(formData.get("ticker"));

  try {
    const result = await submitDiscussionThread({
      actor,
      bodyMarkdown: readRequiredString(formData.get("bodyMarkdown")),
      market,
      sectionAnchor: readString(formData.get("sectionAnchor")),
      ticker,
      title: readRequiredString(formData.get("title"))
    });

    return NextResponse.redirect(withFeedbackUrl(request.url, result.canonicalPath, actor, "thread_created", undefined, result.threadId), 303);
  } catch (error) {
    const fallbackPath = `/stocks/${market.toLowerCase()}/${ticker.toLowerCase()}/discussion`;
    return NextResponse.redirect(withFeedbackUrl(request.url, fallbackPath, actor, undefined, error, undefined), 303);
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
