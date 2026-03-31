import { NextResponse } from "next/server";
import { rejectStockEditProposal } from "../../../../../../src/wiki-edit/review-workflow";

interface ReviewRouteProps {
  params: Promise<{
    revisionId: string;
  }>;
}

export async function POST(request: Request, props: ReviewRouteProps): Promise<NextResponse> {
  const params = await props.params;
  const formData = await request.formData();
  const actor = readString(formData.get("actor"));
  const note = readString(formData.get("note"));

  try {
    await rejectStockEditProposal({
      actor,
      note,
      revisionId: params.revisionId
    });
    return buildRedirect(request, actor, "rejected", params.revisionId);
  } catch (error) {
    return buildRedirect(
      request,
      actor,
      undefined,
      params.revisionId,
      error instanceof Error ? error.message : "Failed to reject revision"
    );
  }
}

function buildRedirect(
  request: Request,
  actor: string | undefined,
  decision: string | undefined,
  revisionId: string,
  error?: string
): NextResponse {
  const redirectUrl = new URL("/review/mod-queue", request.url);

  if (actor) {
    redirectUrl.searchParams.set("actor", actor);
  }
  redirectUrl.searchParams.set("revisionId", revisionId);
  if (decision) {
    redirectUrl.searchParams.set("decision", decision);
  }
  if (error) {
    redirectUrl.searchParams.set("error", encodeURIComponent(error));
  }

  return NextResponse.redirect(redirectUrl, 303);
}

function readString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return value;
}
