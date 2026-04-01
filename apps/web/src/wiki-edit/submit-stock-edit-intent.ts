import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import type { CitationRecord, RevisionStatus, StockKey } from "@stockwiki/domain";
import { getStockWikiSnapshot } from "../stock-page/get-stock-wiki-snapshot";
import { evaluateEditAccess, getFakeSession, type FakeSession } from "./fake-session";
import { savePendingEditDraft } from "./pending-edit-store";
import { evaluateSourcePolicy } from "./source-policy";

const marketDataProvider = new FixtureMarketDataProvider();

export interface SubmitStockEditIntentResult {
  actor: FakeSession;
  canonicalPath: string;
  findingCount: number;
  intentId: string;
  policyStatus: "clear" | "flagged" | "warning";
  reportReasons: string[];
  revisionId: string;
  status: RevisionStatus;
}

export async function submitStockEditIntent(input: {
  actor?: string;
  changedSectionIds: string[];
  citations: CitationRecord[];
  contentMarkdown: string;
  market: string;
  summary: string;
  ticker: string;
}): Promise<SubmitStockEditIntentResult> {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const snapshot = await getStockWikiSnapshot({
    key,
    profile
  });
  const actor = getFakeSession(input.actor);
  const access = evaluateEditAccess(actor, snapshot.page.protectionLevel);

  if (!actor || access.mode !== "can_edit") {
    throw new Error(access.message);
  }

  const summary = input.summary.trim();
  const contentMarkdown = input.contentMarkdown.trim();

  if (!summary) {
    throw new Error("Edit summary is required");
  }

  if (!contentMarkdown) {
    throw new Error("Proposed content is required");
  }
  const changedSectionIds = [...new Set(input.changedSectionIds.map((sectionId) => sectionId.trim()).filter(Boolean))];

  if (changedSectionIds.length === 0) {
    throw new Error("Select at least one changed section");
  }
  const validSectionIds = new Set(snapshot.citationSections.map((section) => section.id));
  const unknownChangedSectionIds = changedSectionIds.filter((sectionId) => !validSectionIds.has(sectionId));

  if (unknownChangedSectionIds.length > 0) {
    throw new Error(`Unknown changed sections: ${unknownChangedSectionIds.join(", ")}`);
  }

  const citations = input.citations.map((citation) => ({
    ...citation,
    label: citation.label.trim(),
    sectionId: citation.sectionId.trim(),
    sourceUrl: citation.sourceUrl.trim()
  }));

  for (const citation of citations) {
    if (!validSectionIds.has(citation.sectionId)) {
      throw new Error(`Citation ${citation.id} points to an unknown section`);
    }
    if (!changedSectionIds.includes(citation.sectionId)) {
      throw new Error(`Citation ${citation.id} must apply to a selected changed section`);
    }
  }

  const policyEvaluation = evaluateSourcePolicy({
    changedSectionIds,
    citations,
    sectionPolicies: snapshot.citationSections
  });

  const draft = savePendingEditDraft({
    authorId: actor.userId,
    changedSectionIds,
    citations,
    contentMarkdown,
    market: key.market,
    pageKey: profile.canonicalPageKey,
    policyEvaluation,
    summary,
    ticker: key.ticker,
    title: profile.name
  });

  return {
    actor,
    canonicalPath: `/stocks/${key.market.toLowerCase()}/${key.ticker}`,
    findingCount: policyEvaluation.policy.findings.length,
    intentId: draft.intentId,
    policyStatus: policyEvaluation.policy.status,
    reportReasons: [...policyEvaluation.policy.reportReasons],
    revisionId: draft.revisionId,
    status: "pending"
  };
}

function normalizeStockKey(input: StockKey): StockKey {
  return {
    market: input.market.toUpperCase(),
    ticker: input.ticker.toUpperCase()
  };
}
