export interface StockKey {
  market: string;
  ticker: string;
}

export type PageKey = string;
export type RevisionId = string;

export type RevisionStatus = "approved" | "pending" | "reverted";
export type PageProtectionLevel = "open" | "semi_protected" | "reviewer_only" | "locked";

export interface PageRevision {
  id: RevisionId;
  summary: string;
  contentMarkdown: string;
  status: RevisionStatus;
  authorId: string;
  createdAt: string;
}

export interface PageContent {
  key: PageKey;
  title: string;
  approvedRevisionId: RevisionId | null;
  latestRevisionId: RevisionId | null;
  revisions: PageRevision[];
  protectionLevel: PageProtectionLevel;
}

export interface RenderedPage {
  key: PageKey;
  revisionId: RevisionId;
  html: string;
  reviewed: boolean;
}

export interface DiffResult {
  fromRevisionId: RevisionId;
  toRevisionId: RevisionId;
  changedLineCount: number;
  summary: string;
}

export interface EditPageInput {
  key: PageKey;
  title: string;
  summary: string;
  contentMarkdown: string;
  authorId: string;
}

export interface EditResult {
  key: PageKey;
  revisionId: RevisionId;
  status: RevisionStatus;
}

export interface RollbackInput {
  key: PageKey;
  toRevisionId: RevisionId;
  authorId: string;
  summary: string;
}

export interface RollbackResult {
  key: PageKey;
  revisionId: RevisionId;
  restoredRevisionId: RevisionId;
}

export interface ProtectPageInput {
  key: PageKey;
  protectionLevel: PageProtectionLevel;
}

export interface RecentChange {
  key: PageKey;
  revisionId: RevisionId;
  status: RevisionStatus;
  createdAt: string;
}

export interface RecentChangeBatch {
  items: RecentChange[];
  nextCursor?: string;
}

export interface WikiEngine {
  getPage(key: PageKey): Promise<PageContent | null>;
  getRenderedHtml(key: PageKey, revisionId?: RevisionId): Promise<RenderedPage>;
  getHistory(key: PageKey): Promise<PageRevision[]>;
  compareRevisions(key: PageKey, from: RevisionId, to: RevisionId): Promise<DiffResult>;
  createOrUpdatePage(input: EditPageInput): Promise<EditResult>;
  rollback(input: RollbackInput): Promise<RollbackResult>;
  protectPage(input: ProtectPageInput): Promise<void>;
  getRecentChanges(cursor?: string): Promise<RecentChangeBatch>;
}

export interface Quote {
  market: string;
  ticker: string;
  currency: string;
  price: number;
  change: number;
  changePct: number;
  marketCap: number;
}

export interface CompanyProfile {
  market: string;
  ticker: string;
  name: string;
  summary: string;
  sector: string;
  industry: string;
  canonicalPageKey: PageKey;
}

export interface Filing {
  id: string;
  title: string;
  filedAt: string;
  sourceUrl: string;
}

export interface CorporateAction {
  id: string;
  actionType: string;
  effectiveAt: string;
  summary: string;
}

export interface MarketDataProvider {
  getQuote(key: StockKey): Promise<Quote>;
  getCompanyProfile(key: StockKey): Promise<CompanyProfile>;
  getRecentFilings(key: StockKey): Promise<Filing[]>;
  getCorporateActions(key: StockKey): Promise<CorporateAction[]>;
}
