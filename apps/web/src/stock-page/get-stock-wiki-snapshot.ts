import type { CompanyProfile, DiffResult, PageContent, PageRevision, RenderedPage, RevisionStatus, StockKey } from "@stockwiki/domain";
import { FakeWikiEngine } from "@stockwiki/wiki-bridge";
import { getStockPageSeed } from "./stock-page-seeds";
import { listStoredEditProposals } from "../wiki-edit/pending-edit-store";

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
  history: PageRevision[];
  latestDiff?: DiffResult;
  latestRevision: PageRevision;
  page: PageContent;
  revisionSummary: StockRevisionSummary;
  seed: ReturnType<typeof getStockPageSeed>;
  wiki: RenderedPage;
}

export async function getStockWikiSnapshot(input: {
  key: StockKey;
  profile: CompanyProfile;
}): Promise<StockWikiSnapshot> {
  const fixtureKey = `${input.key.market}:${input.key.ticker}`;
  const seed = getStockPageSeed(fixtureKey);
  const engine = new FakeWikiEngine();

  for (const revision of seed.revisions) {
    await engine.createOrUpdatePage({
      key: input.profile.canonicalPageKey,
      title: input.profile.name,
      summary: revision.summary,
      contentMarkdown: revision.contentMarkdown,
      authorId: revision.authorId
    });
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

  return {
    approvedRevision,
    history,
    latestDiff,
    latestRevision,
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
