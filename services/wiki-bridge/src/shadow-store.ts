import type {
  WikiPageShadowRecord,
  WikiRevisionShadowRecord,
  WikiShadowSnapshot,
  WikiShadowStore
} from "@stockwiki/domain";

export class InMemoryWikiShadowStore implements WikiShadowStore {
  private readonly pages = new Map<string, WikiPageShadowRecord>();
  private readonly revisions = new Map<string, WikiRevisionShadowRecord>();

  upsertPage(record: WikiPageShadowRecord): void {
    this.pages.set(record.canonicalKey, record);
  }

  upsertRevision(record: WikiRevisionShadowRecord): void {
    this.revisions.set(record.revisionId, record);
  }

  exportSnapshot(): WikiShadowSnapshot {
    return {
      pages: [...this.pages.values()].sort((left, right) => left.canonicalKey.localeCompare(right.canonicalKey)),
      revisions: [...this.revisions.values()].sort((left, right) => left.revisionId.localeCompare(right.revisionId))
    };
  }
}
