import type { CitationRecord, DeadLinkScanResult } from "@stockwiki/domain";

interface LinkProbeResult {
  ok: boolean;
  status: number;
}

export async function scanCitationLinks(input: {
  checkedAt?: string;
  citations: CitationRecord[];
  probe?: (sourceUrl: string) => Promise<LinkProbeResult>;
}): Promise<DeadLinkScanResult> {
  const checkedAt = input.checkedAt ?? new Date().toISOString();
  const probe = input.probe ?? defaultProbe;
  const items = [];

  for (const citation of input.citations) {
    if (!citation.sourceUrl.startsWith("http://") && !citation.sourceUrl.startsWith("https://")) {
      items.push({
        checkedAt,
        citationId: citation.id,
        sourceUrl: citation.sourceUrl,
        status: "skipped" as const
      });
      continue;
    }

    const result = await probe(citation.sourceUrl);
    items.push({
      checkedAt,
      citationId: citation.id,
      httpStatus: result.status,
      sourceUrl: citation.sourceUrl,
      status: result.ok ? ("reachable" as const) : ("dead" as const)
    });
  }

  return {
    checkedCount: items.filter((item) => item.status !== "skipped").length,
    deadCount: items.filter((item) => item.status === "dead").length,
    items
  };
}

async function defaultProbe(sourceUrl: string): Promise<LinkProbeResult> {
  const response = await fetch(sourceUrl, {
    method: "HEAD",
    redirect: "follow"
  });

  return {
    ok: response.ok,
    status: response.status
  };
}
