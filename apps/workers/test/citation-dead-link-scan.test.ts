import { describe, expect, it } from "vitest";
import { scanCitationLinks } from "../src/citation-dead-link-scan.js";

describe("citation dead link scan", () => {
  it("classifies reachable, dead, and skipped citations", async () => {
    const result = await scanCitationLinks({
      checkedAt: "2026-04-01T00:00:00.000Z",
      citations: [
        {
          id: "citation-ok",
          label: "Reachable source",
          sectionId: "recent-events",
          sourceTier: "tier1",
          sourceUrl: "https://example.test/ok"
        },
        {
          id: "citation-dead",
          label: "Dead source",
          sectionId: "recent-events",
          sourceTier: "tier2",
          sourceUrl: "https://example.test/dead"
        },
        {
          id: "citation-skipped",
          label: "Skipped source",
          sectionId: "business-model",
          sourceTier: "tier2",
          sourceUrl: "mailto:editor@example.test"
        }
      ],
      probe: async (sourceUrl) => ({
        ok: sourceUrl.endsWith("/ok"),
        status: sourceUrl.endsWith("/ok") ? 200 : 404
      })
    });

    expect(result.checkedCount).toBe(2);
    expect(result.deadCount).toBe(1);
    expect(result.items[0]?.status).toBe("reachable");
    expect(result.items[1]?.status).toBe("dead");
    expect(result.items[2]?.status).toBe("skipped");
  });
});
