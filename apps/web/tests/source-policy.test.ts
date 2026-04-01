import { moderationFixtureCases } from "@stockwiki/fixtures";
import { describe, expect, it } from "vitest";
import { defaultCitationSectionPolicies, evaluateSourcePolicy } from "../src/wiki-edit/source-policy";

describe("source policy evaluator", () => {
  it("matches the moderation fixture expectations", () => {
    for (const fixture of moderationFixtureCases) {
      const result = evaluateSourcePolicy({
        changedSectionIds: fixture.changedSectionIds,
        citations: fixture.citations,
        now: new Date("2026-04-01T00:00:00.000Z"),
        sectionPolicies: defaultCitationSectionPolicies
      });

      expect(result.policy.status, fixture.id).toBe(fixture.expectedStatus);
      expect(
        result.policy.findings.map((finding) => finding.code).sort(),
        fixture.id
      ).toEqual(fixture.expectedFindingCodes.slice().sort());
      expect(result.policy.reportReasons, fixture.id).toEqual(fixture.expectedReportReasons);
    }
  });
});
