import { describe, expect, it } from "vitest";
import { FakeWikiEngine } from "@stockwiki/wiki-bridge";
import { InMemoryWikiShadowStore } from "@stockwiki/wiki-bridge/shadow-store";
import { syncRecentChangesToShadowStore } from "../src/wiki-recent-changes-sync.js";

describe("wiki recent changes sync", () => {
  it("copies recent changes into page and revision shadow metadata", async () => {
    const engine = new FakeWikiEngine();
    await engine.createOrUpdatePage({
      key: "stock:krx:000660",
      title: "SK hynix",
      summary: "phase 2 approved revision",
      contentMarkdown: "Approved revision",
      authorId: "system"
    });
    await engine.createOrUpdatePage({
      key: "stock:krx:000660",
      title: "SK hynix",
      summary: "phase 2 pending revision",
      contentMarkdown: "Pending revision",
      authorId: "contributor-1"
    });

    const store = new InMemoryWikiShadowStore();
    const result = await syncRecentChangesToShadowStore({
      engine,
      store
    });
    const snapshot = store.exportSnapshot();

    expect(result.pageCount).toBe(1);
    expect(result.revisionCount).toBe(2);
    expect(snapshot.pages[0]?.canonicalKey).toBe("stock:krx:000660");
    expect(snapshot.pages[0]?.status).toBe("pending");
    expect(snapshot.pages[0]?.lastEditedAt).toBe("2026-01-01T00:00:02.000Z");
    expect(snapshot.pages[0]?.lastSeenRevisionId).toBe("rev-2");
    expect(snapshot.revisions.map((item: { status: string }) => item.status)).toContain("pending");
  });
});
