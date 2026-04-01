import type {
  CitationSectionPolicy,
  CompanyProfile,
  DiffResult,
  PageContent,
  PageRevision,
  RenderedPage,
  RevisionSources,
  RevisionStatus,
  StockKey
} from "@stockwiki/domain";
import { FakeWikiEngine } from "@stockwiki/wiki-bridge";
import { getStockPageSeed } from "./stock-page-seeds";
import { listStoredEditProposals } from "../wiki-edit/pending-edit-store";
import { evaluateSourcePolicy } from "../wiki-edit/source-policy";

export interface StockRevisionSummary {
  approvedRevisionId: string;
  historyPath: string;
  latestDiffPath?: string;
  latestRevisionId: string;
  latestRevisionStatus: RevisionStatus;
  pendingRevisionCount: number;
}

export interface StockWikiSnapshot {
  approvedRevision: PageRevision;
  approvedSources: RevisionSourcesSnapshot;
  citationSections: CitationSectionPolicy[];
  history: PageRevision[];
  historySources: RevisionSourcesSnapshot[];
  latestDiff?: DiffResult;
  latestRevision: PageRevision;
  latestSources: RevisionSourcesSnapshot;
  page: PageContent;
  revisionSummary: StockRevisionSummary;
  seed: ReturnType<typeof getStockPageSeed>;
  wiki: RenderedPage;
}

export interface RevisionSourcesSnapshot extends RevisionSources {
  changedSections: CitationSectionPolicy[];
  revisionId: string;
}

export async function getStockWikiSnapshot(input: {
  key: StockKey;
  profile: CompanyProfile;
}): Promise<StockWikiSnapshot> {
  const fixtureKey = `${input.key.market}:${input.key.ticker}`;
  const seed = getStockPageSeed(fixtureKey);
  const engine = new FakeWikiEngine();
  const revisionSourceMap = new Map<string, RevisionSources>();

  for (const revision of seed.revisions) {
    const createdRevision = await engine.createOrUpdatePage({
      key: input.profile.canonicalPageKey,
      title: input.profile.name,
      summary: revision.summary,
      contentMarkdown: revision.contentMarkdown,
      authorId: revision.authorId
    });
    revisionSourceMap.set(
      createdRevision.revisionId,
      evaluateSourcePolicy({
        changedSectionIds: revision.changedSectionIds,
        citations: revision.citations,
        sectionPolicies: seed.citationSections
      })
    );
  }

  for (const draft of listStoredEditProposals(input.profile.canonicalPageKey)) {
    engine.seedRevision({
      key: draft.pageKey,
      revisionId: draft.revisionId,
      status: draft.status,
      title: draft.title,
      summary: draft.summary,
      contentMarkdown: draft.contentMarkdown,
      authorId: draft.authorId
    });
    revisionSourceMap.set(draft.revisionId, {
      changedSectionIds: [...draft.changedSectionIds],
      citations: [...draft.citations],
      policy: draft.policy,
      queuePriority: draft.queuePriority
    });
  }

  const page = await engine.getPage(input.profile.canonicalPageKey);
  if (!page?.approvedRevisionId || !page.latestRevisionId) {
    throw new Error(`Wiki page ${input.profile.canonicalPageKey} is missing approved or latest revision`);
  }

  const history = await engine.getHistory(input.profile.canonicalPageKey);
  const approvedRevision = requireRevision(history, page.approvedRevisionId);
  const latestRevision = requireRevision(history, page.latestRevisionId);
  const latestDiff =
    approvedRevision.id === latestRevision.id
      ? undefined
      : await engine.compareRevisions(input.profile.canonicalPageKey, approvedRevision.id, latestRevision.id);
  const wiki = await engine.getRenderedHtml(input.profile.canonicalPageKey);
  const basePath = `/stocks/${input.key.market.toLowerCase()}/${input.key.ticker}`;
  const historySources = history.map((revision) => buildRevisionSourcesSnapshot(seed.citationSections, revision.id, revisionSourceMap));
  const approvedSources = historySources.find((item) => item.revisionId === approvedRevision.id) ?? emptyRevisionSourcesSnapshot(approvedRevision.id);
  const latestSources = historySources.find((item) => item.revisionId === latestRevision.id) ?? emptyRevisionSourcesSnapshot(latestRevision.id);

  return {
    approvedRevision,
    approvedSources,
    citationSections: seed.citationSections,
    history,
    historySources,
    latestDiff,
    latestRevision,
    latestSources,
    page,
    revisionSummary: {
      approvedRevisionId: approvedRevision.id,
      historyPath: `${basePath}/history`,
      latestDiffPath: latestDiff ? `${basePath}/diff/${approvedRevision.id}...${latestRevision.id}` : undefined,
      latestRevisionId: latestRevision.id,
      latestRevisionStatus: latestRevision.status,
      pendingRevisionCount: history.filter((revision) => revision.status === "pending").length
    },
    seed,
    wiki
  };
}

function requireRevision(history: PageRevision[], revisionId: string): PageRevision {
  const revision = history.find((item) => item.id === revisionId);
  if (!revision) {
    throw new Error(`Missing revision ${revisionId}`);
  }

  return revision;
}

function buildRevisionSourcesSnapshot(
  sectionPolicies: CitationSectionPolicy[],
  revisionId: string,
  revisionSourceMap: Map<string, RevisionSources>
): RevisionSourcesSnapshot {
  const sources = revisionSourceMap.get(revisionId);
  if (!sources) {
    return emptyRevisionSourcesSnapshot(revisionId);
  }

  return {
    ...sources,
    changedSectionIds: [...sources.changedSectionIds],
    changedSections: sectionPolicies.filter((section) => sources.changedSectionIds.includes(section.id)),
    citations: [...sources.citations],
    policy: {
      ...sources.policy,
      findings: [...sources.policy.findings],
      reportReasons: [...sources.policy.reportReasons]
    },
    revisionId
  };
}

function emptyRevisionSourcesSnapshot(revisionId: string): RevisionSourcesSnapshot {
  return {
    changedSectionIds: [],
    changedSections: [],
    citations: [],
    policy: {
      citationCount: 0,
      findings: [],
      flaggedForModeration: false,
      missingRequiredCitation: false,
      outdatedCitationCount: 0,
      reportReasons: [],
      status: "clear"
    },
    queuePriority: "normal",
    revisionId
  };
}
