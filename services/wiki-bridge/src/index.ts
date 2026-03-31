import type {
  DiffResult,
  EditPageInput,
  EditResult,
  PageContent,
  PageKey,
  PageRevision,
  ProtectPageInput,
  RecentChangeBatch,
  RenderedPage,
  RevisionId,
  RollbackInput,
  RollbackResult,
  WikiEngine
} from "@stockwiki/domain";

interface StoredPage {
  key: PageKey;
  title: string;
  approvedRevisionId: RevisionId | null;
  latestRevisionId: RevisionId | null;
  revisions: PageRevision[];
  protectionLevel: PageContent["protectionLevel"];
}

export class FakeWikiEngine implements WikiEngine {
  private readonly pages = new Map<PageKey, StoredPage>();
  private revisionSequence = 0;

  async getPage(key: PageKey): Promise<PageContent | null> {
    const page = this.pages.get(key);
    return page ? this.toPageContent(page) : null;
  }

  async getRenderedHtml(key: PageKey, revisionId?: RevisionId): Promise<RenderedPage> {
    const page = this.requirePage(key);
    const resolvedRevisionId = revisionId ?? page.approvedRevisionId ?? page.latestRevisionId;
    if (!resolvedRevisionId) {
      throw new Error(`Page ${key} has no revisions`);
    }

    const revision = page.revisions.find((candidate) => candidate.id === resolvedRevisionId);
    if (!revision) {
      throw new Error(`Revision ${resolvedRevisionId} not found for ${key}`);
    }

    return {
      key,
      revisionId: revision.id,
      html: `<article><p>${escapeHtml(revision.contentMarkdown).replace(/\n/g, "<br />")}</p></article>`,
      reviewed: revision.id === page.approvedRevisionId
    };
  }

  async getHistory(key: PageKey): Promise<PageRevision[]> {
    return [...this.requirePage(key).revisions].reverse();
  }

  async compareRevisions(key: PageKey, from: RevisionId, to: RevisionId): Promise<DiffResult> {
    const page = this.requirePage(key);
    const fromRevision = this.requireRevision(page, from);
    const toRevision = this.requireRevision(page, to);
    const changedLineCount = countChangedLines(fromRevision.contentMarkdown, toRevision.contentMarkdown);

    return {
      fromRevisionId: from,
      toRevisionId: to,
      changedLineCount,
      summary: `${changedLineCount} changed line(s)`
    };
  }

  async createOrUpdatePage(input: EditPageInput): Promise<EditResult> {
    const page = this.pages.get(input.key);
    const isFirstRevision = !page;
    const revision = this.makeRevision(input, isFirstRevision ? "approved" : "pending");

    if (!page) {
      this.pages.set(input.key, {
        key: input.key,
        title: input.title,
        approvedRevisionId: revision.id,
        latestRevisionId: revision.id,
        revisions: [revision],
        protectionLevel: "open"
      });
    } else {
      page.title = input.title;
      page.latestRevisionId = revision.id;
      page.revisions.push(revision);
    }

    return {
      key: input.key,
      revisionId: revision.id,
      status: revision.status
    };
  }

  async rollback(input: RollbackInput): Promise<RollbackResult> {
    const page = this.requirePage(input.key);
    const target = this.requireRevision(page, input.toRevisionId);
    const revision = this.makeRevision(
      {
        key: input.key,
        title: page.title,
        summary: input.summary,
        contentMarkdown: target.contentMarkdown,
        authorId: input.authorId
      },
      "approved"
    );

    page.approvedRevisionId = revision.id;
    page.latestRevisionId = revision.id;
    page.revisions.push(revision);

    return {
      key: input.key,
      revisionId: revision.id,
      restoredRevisionId: target.id
    };
  }

  async protectPage(input: ProtectPageInput): Promise<void> {
    const page = this.requirePage(input.key);
    page.protectionLevel = input.protectionLevel;
  }

  async getRecentChanges(): Promise<RecentChangeBatch> {
    const items = [...this.pages.values()]
      .flatMap((page) =>
        page.revisions.map((revision) => ({
          key: page.key,
          revisionId: revision.id,
          status: revision.status,
          createdAt: revision.createdAt
        }))
      )
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 20);

    return {
      items
    };
  }

  private makeRevision(input: EditPageInput, status: PageRevision["status"]): PageRevision {
    this.revisionSequence += 1;

    return {
      id: `rev-${this.revisionSequence}`,
      summary: input.summary,
      contentMarkdown: input.contentMarkdown,
      status,
      authorId: input.authorId,
      createdAt: new Date().toISOString()
    };
  }

  private requirePage(key: PageKey): StoredPage {
    const page = this.pages.get(key);
    if (!page) {
      throw new Error(`Page ${key} not found`);
    }
    return page;
  }

  private requireRevision(page: StoredPage, revisionId: RevisionId): PageRevision {
    const revision = page.revisions.find((candidate) => candidate.id === revisionId);
    if (!revision) {
      throw new Error(`Revision ${revisionId} not found for ${page.key}`);
    }
    return revision;
  }

  private toPageContent(page: StoredPage): PageContent {
    return {
      key: page.key,
      title: page.title,
      approvedRevisionId: page.approvedRevisionId,
      latestRevisionId: page.latestRevisionId,
      revisions: [...page.revisions],
      protectionLevel: page.protectionLevel
    };
  }
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function countChangedLines(from: string, to: string): number {
  const left = from.split("\n");
  const right = to.split("\n");
  const max = Math.max(left.length, right.length);
  let count = 0;

  for (let index = 0; index < max; index += 1) {
    if ((left[index] ?? "") !== (right[index] ?? "")) {
      count += 1;
    }
  }

  return count;
}
