import { beforeEach, describe, expect, it } from "vitest";
import { GET as getPublicSearch } from "../app/api/public/search/route";
import { resetDiscussionStore } from "../src/discussion/discussion-store";
import { getSearchPageData } from "../src/search/search-read-model";

describe("phase 6 search shell", () => {
  beforeEach(() => {
    resetDiscussionStore();
  });

  it("ranks exact ticker matches above other public results and exposes lag metrics", () => {
    const data = getSearchPageData("005930");
    const stockGroup = data.groups.find((group) => group.id === "stocks");

    expect(stockGroup?.items[0]?.title).toBe("Samsung Electronics");
    expect(stockGroup?.items[0]?.matchKind).toBe("exact_ticker");
    expect(stockGroup?.items[0]?.canonicalPath).toBe("/stocks/krx/005930");
    expect(data.indexSync.handledEventKinds).toEqual(["approved_review", "alias_updated", "discussion_created"]);
    expect(data.indexSync.lag.pendingEventCount).toBe(1);
    expect(data.indexSync.lag.lagMinutes).toBe(6);
  });

  it("supports alias queries and excludes noindex stock pages from public results", () => {
    const aliasResult = getSearchPageData("SEC");
    const aliasStock = aliasResult.groups.find((group) => group.id === "stocks")?.items[0];
    const noindexResult = getSearchPageData("NAVER");

    expect(aliasStock?.title).toBe("Samsung Electronics");
    expect(aliasStock?.matchKind).toBe("alias");
    expect(aliasStock?.matchedText).toBe("SEC");
    expect(aliasResult.autocomplete.some((item) => item.value === "SEC")).toBe(true);
    expect(noindexResult.totalResultCount).toBe(0);
  });

  it("returns discussion matches in a lower-priority group", () => {
    const data = getSearchPageData("해석");
    const discussionGroup = data.groups.find((group) => group.id === "discussions");

    expect(discussionGroup?.items[0]?.title).toContain("실적");
    expect(discussionGroup?.items[0]?.canonicalPath).toContain("/stocks/krx/005930/discussion#");
  });

  it("serves the public search api payload", async () => {
    const response = await getPublicSearch(new Request("http://localhost:3000/api/public/search?q=SEC"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      query: "SEC",
      totalResultCount: 1,
      indexSync: {
        lag: {
          pendingEventCount: 1
        }
      }
    });
  });
});
