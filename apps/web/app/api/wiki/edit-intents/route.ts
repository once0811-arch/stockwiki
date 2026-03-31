import { NextResponse } from "next/server";
import { submitStockEditIntent } from "../../../../src/wiki-edit/submit-stock-edit-intent";

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const actor = readString(formData.get("actor"));
  const market = readRequiredString(formData.get("market"));
  const ticker = readRequiredString(formData.get("ticker"));
  const summary = readRequiredString(formData.get("summary"));
  const contentMarkdown = readRequiredString(formData.get("contentMarkdown"));

  try {
    const result = await submitStockEditIntent({
      actor,
      contentMarkdown,
      market,
      summary,
      ticker
    });
    const redirectUrl = new URL(`${result.canonicalPath}/edit`, request.url);

    if (actor) {
      redirectUrl.searchParams.set("actor", actor);
    }
    redirectUrl.searchParams.set("submitted", "1");
    redirectUrl.searchParams.set("intentId", result.intentId);

    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    const fallbackUrl = new URL(`/stocks/${market.toLowerCase()}/${ticker.toLowerCase()}/edit`, request.url);

    if (actor) {
      fallbackUrl.searchParams.set("actor", actor);
    }
    fallbackUrl.searchParams.set(
      "error",
      encodeURIComponent(error instanceof Error ? error.message : "Failed to save edit intent")
    );

    return NextResponse.redirect(fallbackUrl, 303);
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
