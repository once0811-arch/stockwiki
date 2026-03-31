import type { WikiEngine, WikiRecentChangesSyncResult, WikiShadowStore } from "@stockwiki/domain";
import type { PageRevision } from "@stockwiki/domain";

export async function syncRecentChangesToShadowStore(input: {
  engine: WikiEngine;
  store: WikiShadowStore;
}): Promise<WikiRecentChangesSyncResult> {
  const recentChanges = await input.engine.getRecentChanges();
  const touchedPages = new Set<string>();
  let revisionCount = 0;

  for (const change of recentChanges.items) {
    const page = await input.engine.getPage(change.key);
    if (!page) {
      continue;
    }

    const revision = page.revisions.find((candidate) => candidate.id === change.revisionId);
    if (!revision) {
      continue;
    }

    if (!touchedPages.has(page.key)) {
      const latestRevision = page.latestRevisionId ? findRevision(page.revisions, page.latestRevisionId) : undefined;
      const approvedRevision = page.approvedRevisionId
        ? findRevision(page.revisions, page.approvedRevisionId)
        : undefined;

      input.store.upsertPage({
        canonicalKey: page.key,
        lastEditedAt: latestRevision?.createdAt ?? revision.createdAt,
        lastReviewedAt: approvedRevision?.createdAt ?? null,
        lastReviewedRevisionId: page.approvedRevisionId,
        lastSeenRevisionId: page.latestRevisionId,
        mediawikiTitle: page.title,
        protectionLevel: page.protectionLevel,
        status: latestRevision?.status ?? revision.status
      });
      touchedPages.add(page.key);
    }

    input.store.upsertRevision({
      authorUserId: revision.authorId,
      createdAt: revision.createdAt,
      pageCanonicalKey: page.key,
      revisionId: revision.id,
      status: revision.status,
      summary: revision.summary
    });

    revisionCount += 1;
  }

  return {
    pageCount: touchedPages.size,
    revisionCount
  };
}

function findRevision(revisions: PageRevision[], revisionId: string): PageRevision | undefined {
  return revisions.find((item) => item.id === revisionId);
}
