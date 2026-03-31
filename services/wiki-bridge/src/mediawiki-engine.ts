import type {
  DiffResult,
  HistoryQuery,
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

export interface MediaWikiEngineOptions {
  apiBaseUrl: string;
}

export class MediaWikiEngine implements WikiEngine {
  constructor(private readonly options: MediaWikiEngineOptions) {}

  async getPage(_key: PageKey): Promise<PageContent | null> {
    void _key;
    throw this.createSkeletonError();
  }

  async getRenderedHtml(_key: PageKey, _revisionId?: RevisionId): Promise<RenderedPage> {
    void _key;
    void _revisionId;
    throw this.createSkeletonError();
  }

  async getHistory(_key: PageKey, _params?: HistoryQuery): Promise<PageRevision[]> {
    void _key;
    void _params;
    throw this.createSkeletonError();
  }

  async compareRevisions(_key: PageKey, _from: RevisionId, _to: RevisionId): Promise<DiffResult> {
    void _key;
    void _from;
    void _to;
    throw this.createSkeletonError();
  }

  async createOrUpdatePage(): Promise<never> {
    throw this.createSkeletonError();
  }

  async rollback(_input: RollbackInput): Promise<RollbackResult> {
    void _input;
    throw this.createSkeletonError();
  }

  async protectPage(_input: ProtectPageInput): Promise<void> {
    void _input;
    throw this.createSkeletonError();
  }

  async getRecentChanges(): Promise<RecentChangeBatch> {
    throw this.createSkeletonError();
  }

  private createSkeletonError(): Error {
    return new Error(
      `MediaWikiEngine skeleton: real integration must use the official MediaWiki API at ${this.options.apiBaseUrl}`
    );
  }
}
