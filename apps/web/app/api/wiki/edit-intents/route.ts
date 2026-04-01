import { NextResponse } from "next/server";
import type { CitationRecord, SourceTier } from "@stockwiki/domain";
import { submitStockEditIntent } from "../../../../src/wiki-edit/submit-stock-edit-intent";

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const actor = readString(formData.get("actor"));
  const market = readRequiredString(formData.get("market"));
  const ticker = readRequiredString(formData.get("ticker"));
  const changedSectionIds = readStringArray(formData.getAll("changedSectionId"));
  const citations = parseCitationInputs(formData);
  const summary = readRequiredString(formData.get("summary"));
  const contentMarkdown = readRequiredString(formData.get("contentMarkdown"));

  try {
    const result = await submitStockEditIntent({
      actor,
      changedSectionIds,
      citations,
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
    redirectUrl.searchParams.set("policyStatus", result.policyStatus);
    redirectUrl.searchParams.set("findingCount", String(result.findingCount));
    if (result.reportReasons.length > 0) {
      redirectUrl.searchParams.set("reportReasons", result.reportReasons.join(","));
    }

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

function readStringArray(values: FormDataEntryValue[]): string[] {
  return values.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean);
}

function parseCitationInputs(formData: FormData): CitationRecord[] {
  const labels = readIndexedStringArray(formData.getAll("citationLabel"));
  const sourceUrls = readIndexedStringArray(formData.getAll("citationUrl"));
  const sourceTiers = readIndexedStringArray(formData.getAll("citationTier"));
  const publishedDates = readIndexedStringArray(formData.getAll("citationPublishedAt"));
  const sectionIds = readIndexedStringArray(formData.getAll("citationSectionId"));
  const maxLength = Math.max(labels.length, sourceUrls.length, sourceTiers.length, publishedDates.length, sectionIds.length);
  const citations: CitationRecord[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    const label = labels[index] ?? "";
    const sourceUrl = sourceUrls[index] ?? "";
    const sourceTier = sourceTiers[index] ?? "";
    const publishedAt = publishedDates[index] ?? "";
    const sectionId = sectionIds[index] ?? "";
    const hasAnyValue = [label, sourceUrl, sourceTier, publishedAt, sectionId].some(Boolean);

    if (!hasAnyValue) {
      continue;
    }
    if (!label || !sourceUrl || !sourceTier || !sectionId) {
      throw new Error(`Citation ${index + 1} is incomplete`);
    }
    if (!isSourceTier(sourceTier)) {
      throw new Error(`Citation ${index + 1} has an unknown source tier`);
    }
    if (publishedAt && Number.isNaN(new Date(publishedAt).valueOf())) {
      throw new Error(`Citation ${index + 1} has an invalid published date`);
    }

    citations.push({
      id: `citation-${index + 1}`,
      label,
      publishedAt: publishedAt || undefined,
      sectionId,
      sourceTier,
      sourceUrl
    });
  }

  return citations;
}

function isSourceTier(value: string): value is SourceTier {
  return value === "tier1" || value === "tier2" || value === "tier3" || value === "tier4";
}

function readIndexedStringArray(values: FormDataEntryValue[]): string[] {
  return values.map((value) => (typeof value === "string" ? value.trim() : ""));
}
