import { NextResponse } from "next/server";
import { submitDiscussionComment } from "../../../../src/discussion/discussion-actions";

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const actor = readString(formData.get("actor"));
  const market = readRequiredString(formData.get("market"));
  const ticker = readRequiredString(formData.get("ticker"));
  const threadId = readRequiredString(formData.get("threadId"));

  try {
    const result = await submitDiscussionComment({
      actor,
      bodyMarkdown: readRequiredString(formData.get("bodyMarkdown")),
      market,
      parentCommentId: readString(formData.get("parentCommentId")),
      threadId,
      ticker
    });

    return NextResponse.redirect(
      withFeedbackUrl(request.url, result.canonicalPath, actor, "comment_added", undefined, result.commentId),
      303
    );
  } catch (error) {
    const fallbackPath = `/stocks/${market.toLowerCase()}/${ticker.toLowerCase()}/discussion`;
    return NextResponse.redirect(withFeedbackUrl(request.url, fallbackPath, actor, undefined, error, threadId), 303);
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
