import { createPhase0WikiEngineContractSuite } from "@stockwiki/testkit";
import { describe } from "vitest";
import { FakeWikiEngine } from "../src/index.js";

describe("FakeWikiEngine", () => {
  createPhase0WikiEngineContractSuite("FakeWikiEngine contract", () => new FakeWikiEngine());
});
