import { describe, expect, it } from "vitest";
import { searchIndexEventFixtures, searchIndexFixtureCheckpoint } from "@stockwiki/fixtures";
import { syncSearchIndex } from "../src/search-index-sync.js";

describe("search index sync skeleton", () => {
  it("summarizes fake-first indexing lag and handled event kinds", () => {
    const result = syncSearchIndex({
      events: searchIndexEventFixtures,
      indexedThrough: searchIndexFixtureCheckpoint.indexedThrough
    });

    expect(result.handledEventCount).toBe(3);
    expect(result.indexedPageCount).toBe(2);
    expect(result.handledEventKinds).toEqual(["approved_review", "alias_updated", "discussion_created"]);
    expect(result.lag.pendingEventCount).toBe(1);
    expect(result.lag.lagMinutes).toBe(6);
  });
});
