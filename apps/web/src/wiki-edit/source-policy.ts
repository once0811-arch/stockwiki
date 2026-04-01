import {
  sourceTierDefinitions,
  type CitationRecord,
  type CitationSectionPolicy,
  type QueuePriority,
  type RevisionSources,
  type SourcePolicyFinding,
  type SourceTier
} from "@stockwiki/domain";

const RECENCY_WINDOW_DAYS = 730;

const tierRank: Record<SourceTier, number> = {
  tier1: 1,
  tier2: 2,
  tier3: 3,
  tier4: 4
};

export const defaultCitationSectionPolicies: CitationSectionPolicy[] = [
  {
    id: "business-model",
    label: "Business Model",
    description: "Core business description, strategy, and product positioning.",
    citationRequired: true,
    contentious: false,
    minTier: "tier2",
    requiresRecentSource: false
  },
  {
    id: "financial-performance",
    label: "Financial Performance",
    description: "Numbers, ratios, guidance, and other investor-facing operating metrics.",
    citationRequired: true,
    contentious: false,
    minTier: "tier1",
    requiresRecentSource: true
  },
  {
    id: "recent-events",
    label: "Recent Events",
    description: "Recent disclosures, material developments, and event timelines.",
    citationRequired: true,
    contentious: true,
    minTier: "tier1",
    requiresRecentSource: true
  },
  {
    id: "governance-risk",
    label: "Governance & Risk",
    description: "Contentious governance issues, legal matters, or negative claims about people.",
    citationRequired: true,
    contentious: true,
    minTier: "tier1",
    requiresRecentSource: true
  }
];

export function getSourceTierGuidance() {
  return sourceTierDefinitions;
}

export function evaluateSourcePolicy(input: {
  changedSectionIds: string[];
  citations: CitationRecord[];
  now?: Date;
  sectionPolicies: CitationSectionPolicy[];
}): RevisionSources {
  const now = input.now ?? new Date();
  const findings: SourcePolicyFinding[] = [];
  const reportReasons = new Set<"no_citation">();
  const sectionPolicyMap = new Map(input.sectionPolicies.map((section) => [section.id, section]));
  let outdatedCitationCount = 0;
  let missingRequiredCitation = false;

  for (const sectionId of input.changedSectionIds) {
    const section = sectionPolicyMap.get(sectionId);
    if (!section) {
      continue;
    }

    const sectionCitations = input.citations.filter((citation) => citation.sectionId === sectionId);
    if (section.citationRequired && sectionCitations.length === 0) {
      missingRequiredCitation = true;
      reportReasons.add("no_citation");
      findings.push({
        code: "missing_required_citation",
        message: `${section.label} requires at least one citation before review.`,
        reportReason: "no_citation",
        sectionId,
        severity: section.contentious ? "high" : "warning"
      });
      continue;
    }

    const bestCitationTier = sectionCitations.reduce<SourceTier | null>((best, citation) => {
      if (!best || tierRank[citation.sourceTier] < tierRank[best]) {
        return citation.sourceTier;
      }

      return best;
    }, null);
    if (bestCitationTier && tierRank[bestCitationTier] > tierRank[section.minTier]) {
      findings.push({
        code: "low_tier_source",
        message: `${section.label} should prefer ${getTierLabel(section.minTier)} sources or stronger.`,
        sectionId,
        severity: "warning"
      });
    }

    if (section.requiresRecentSource && sectionCitations.length > 0) {
      const hasFreshCitation = sectionCitations.some((citation) => !isCitationOutdated(citation, now));
      if (!hasFreshCitation) {
        outdatedCitationCount += 1;
        findings.push({
          code: "outdated_source",
          message: `${section.label} only has sources older than 24 months.`,
          sectionId,
          severity: "warning"
        });
      }
    }
  }

  const status =
    findings.some((finding) => finding.severity === "high")
      ? "flagged"
      : findings.length > 0
        ? "warning"
        : "clear";
  const queuePriority: QueuePriority = status === "flagged" ? "high" : "normal";

  return {
    changedSectionIds: [...input.changedSectionIds],
    citations: [...input.citations],
    policy: {
      citationCount: input.citations.length,
      findings,
      flaggedForModeration: status === "flagged",
      missingRequiredCitation,
      outdatedCitationCount,
      reportReasons: [...reportReasons],
      status
    },
    queuePriority
  };
}

export function getChangedSectionLabels(sectionPolicies: CitationSectionPolicy[], changedSectionIds: string[]): string[] {
  const sectionMap = new Map(sectionPolicies.map((section) => [section.id, section.label]));

  return changedSectionIds.map((sectionId) => sectionMap.get(sectionId) ?? sectionId);
}

function isCitationOutdated(citation: CitationRecord, now: Date): boolean {
  if (!citation.publishedAt) {
    return false;
  }

  const publishedAt = new Date(citation.publishedAt);
  if (Number.isNaN(publishedAt.valueOf())) {
    return false;
  }

  const ageInDays = (now.valueOf() - publishedAt.valueOf()) / (1000 * 60 * 60 * 24);
  return ageInDays > RECENCY_WINDOW_DAYS;
}

function getTierLabel(tier: SourceTier): string {
  return sourceTierDefinitions.find((definition) => definition.tier === tier)?.label ?? tier;
}
