import { describe, expect, it } from "vitest";
import { MediaWikiEngine } from "../src/mediawiki-engine.js";

describe("MediaWikiEngine", () => {
  it("fails as an API-only skeleton until real integration is wired", async () => {
    const engine = new MediaWikiEngine({
      apiBaseUrl: "https://example.test/api.php"
    });

    await expect(engine.getPage("stock:krx:005930")).rejects.toThrow("MediaWikiEngine skeleton");
    await expect(engine.getRecentChanges()).rejects.toThrow("official MediaWiki API");
  });
});
