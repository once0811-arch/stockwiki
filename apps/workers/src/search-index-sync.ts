import type { SearchIndexEvent, SearchIndexSyncResult } from "@stockwiki/domain";
import { buildSearchIndexSyncResult } from "@stockwiki/domain";

export function syncSearchIndex(input: {
  events: SearchIndexEvent[];
  indexedThrough: string;
}): SearchIndexSyncResult {
  return buildSearchIndexSyncResult(input);
}
