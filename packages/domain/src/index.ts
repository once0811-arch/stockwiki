export interface StockKey {
  market: string;
  ticker: string;
}

export type PageKey = string;
export type RevisionId = string;
export type SourceTier = "tier1" | "tier2" | "tier3" | "tier4";
export type UserRole =
  | "reader"
  | "member"
  | "contributor"
  | "trusted_contributor"
  | "reviewer"
  | "moderator"
  | "admin";

export type RevisionStatus = "approved" | "pending" | "rejected" | "reverted";
export type PageProtectionLevel = "open" | "semi_protected" | "reviewer_only" | "locked";
export type ReportReason = "no_citation";
export type SourcePolicySeverity = "info" | "warning" | "high";
export type SourcePolicyStatus = "clear" | "warning" | "flagged";
export type SourcePolicyFindingCode = "missing_required_citation" | "outdated_source" | "low_tier_source";
export type QueuePriority = "normal" | "high";

export interface SourceTierDefinition {
  articleUsage: string;
  description: string;
  label: string;
  tier: SourceTier;
}

export interface CitationSectionPolicy {
  citationRequired: boolean;
  contentious: boolean;
  description: string;
  id: string;
  label: string;
  minTier: SourceTier;
  requiresRecentSource: boolean;
}

export interface CitationRecord {
  id: string;
  label: string;
  publishedAt?: string;
  sectionId: string;
  sourceTier: SourceTier;
  sourceUrl: string;
}

export interface SourcePolicyFinding {
  citationId?: string;
  code: SourcePolicyFindingCode;
  message: string;
  reportReason?: ReportReason;
  sectionId?: string;
  severity: SourcePolicySeverity;
}

export interface SourcePolicyResult {
  citationCount: number;
  findings: SourcePolicyFinding[];
  flaggedForModeration: boolean;
  missingRequiredCitation: boolean;
  outdatedCitationCount: number;
  reportReasons: ReportReason[];
  status: SourcePolicyStatus;
}

export interface RevisionSources {
  changedSectionIds: string[];
  citations: CitationRecord[];
  policy: SourcePolicyResult;
  queuePriority: QueuePriority;
}

export interface DeadLinkScanItem {
  checkedAt: string;
  citationId: string;
  httpStatus?: number;
  sourceUrl: string;
  status: "dead" | "reachable" | "skipped";
}

export interface DeadLinkScanResult {
  checkedCount: number;
  deadCount: number;
  items: DeadLinkScanItem[];
}

export const sourceTierDefinitions: SourceTierDefinition[] = [
  {
    tier: "tier1",
    label: "Tier 1",
    description: "Primary official disclosures such as exchange filings, regulator filings, and company IR materials.",
    articleUsage: "Preferred for numbers, disclosures, and recent events."
  },
  {
    tier: "tier2",
    label: "Tier 2",
    description: "Major reliable media, official interviews, and earnings call transcripts.",
    articleUsage: "Acceptable supporting context when a primary source is not available."
  },
  {
    tier: "tier3",
    label: "Tier 3",
    description: "Market data vendors and licensed industry research that still needs reviewer judgment.",
    articleUsage: "Use sparingly and prefer a stronger source when possible."
  },
  {
    tier: "tier4",
    label: "Tier 4",
    description: "Community posts, blogs, and social media.",
    articleUsage: "Restricted for article body claims and should trigger reviewer scrutiny."
  }
];

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

export interface HistoryQuery {
  status?: RevisionStatus;
  limit?: number;
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

export interface WikiPageShadowRecord {
  canonicalKey: string;
  lastEditedAt: string | null;
  lastReviewedAt: string | null;
  lastReviewedRevisionId: RevisionId | null;
  lastSeenRevisionId: RevisionId | null;
  mediawikiTitle: string;
  protectionLevel: PageProtectionLevel;
  status: RevisionStatus;
}

export interface WikiRevisionShadowRecord {
  authorUserId: string | null;
  createdAt: string;
  pageCanonicalKey: string;
  revisionId: RevisionId;
  status: RevisionStatus;
  summary: string;
}

export interface WikiShadowSnapshot {
  pages: WikiPageShadowRecord[];
  revisions: WikiRevisionShadowRecord[];
}

export interface WikiShadowStore {
  exportSnapshot(): WikiShadowSnapshot;
  upsertPage(record: WikiPageShadowRecord): void;
  upsertRevision(record: WikiRevisionShadowRecord): void;
}

export interface WikiRecentChangesSyncResult {
  pageCount: number;
  revisionCount: number;
}

export interface WikiEngine {
  getPage(key: PageKey): Promise<PageContent | null>;
  getRenderedHtml(key: PageKey, revisionId?: RevisionId): Promise<RenderedPage>;
  getHistory(key: PageKey, params?: HistoryQuery): Promise<PageRevision[]>;
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
  aliases: string[];
  market: string;
  ticker: string;
  name: string;
  summary: string;
  sector: string;
  industry: string;
  canonicalPageKey: PageKey;
}

export type SearchIndexEventKind = "alias_updated" | "approved_review" | "discussion_created";
export type SearchIndexLagStatus = "fresh" | "lagging";

export interface SearchIndexEvent {
  id: string;
  kind: SearchIndexEventKind;
  occurredAt: string;
  pageKey: PageKey;
}

export interface SearchIndexLagSnapshot {
  indexedThrough: string;
  lagMinutes: number;
  lastEventAt: string | null;
  pendingEventCount: number;
  status: SearchIndexLagStatus;
}

export interface SearchIndexSyncResult {
  handledEventCount: number;
  handledEventKinds: SearchIndexEventKind[];
  indexedPageCount: number;
  lag: SearchIndexLagSnapshot;
}

export function buildSearchIndexLagSnapshot(input: {
  events: SearchIndexEvent[];
  indexedThrough: string;
}): SearchIndexLagSnapshot {
  const { events, indexedThrough } = input;
  const sortedEvents = [...events].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
  const lastEventAt = sortedEvents.at(-1)?.occurredAt ?? null;
  const pendingEvents = sortedEvents.filter((event) => event.occurredAt > indexedThrough);
  const lagMinutes =
    pendingEvents.length === 0 || !lastEventAt
      ? 0
      : Math.max(
          0,
          Math.round((Date.parse(lastEventAt) - Date.parse(indexedThrough)) / (1000 * 60))
        );

  return {
    indexedThrough,
    lagMinutes,
    lastEventAt,
    pendingEventCount: pendingEvents.length,
    status: pendingEvents.length > 0 ? "lagging" : "fresh"
  };
}

export function buildSearchIndexSyncResult(input: {
  events: SearchIndexEvent[];
  indexedThrough: string;
}): SearchIndexSyncResult {
  const handledEventKinds = [...new Set(input.events.map((event) => event.kind))];
  const indexedPageCount = new Set(input.events.map((event) => event.pageKey)).size;

  return {
    handledEventCount: input.events.length,
    handledEventKinds,
    indexedPageCount,
    lag: buildSearchIndexLagSnapshot(input)
  };
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
