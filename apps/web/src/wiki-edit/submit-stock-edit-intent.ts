import { FixtureMarketDataProvider } from "@stockwiki/fixtures";
import type { RevisionStatus, StockKey } from "@stockwiki/domain";
import { getStockWikiSnapshot } from "../stock-page/get-stock-wiki-snapshot";
import { evaluateEditAccess, getFakeSession, type FakeSession } from "./fake-session";
import { savePendingEditDraft } from "./pending-edit-store";

const marketDataProvider = new FixtureMarketDataProvider();

export interface SubmitStockEditIntentResult {
  actor: FakeSession;
  canonicalPath: string;
  intentId: string;
  revisionId: string;
  status: RevisionStatus;
}

export async function submitStockEditIntent(input: {
  actor?: string;
  contentMarkdown: string;
  market: string;
  summary: string;
  ticker: string;
}): Promise<SubmitStockEditIntentResult> {
  const key = normalizeStockKey(input);
  const profile = await marketDataProvider.getCompanyProfile(key);
  const snapshot = await getStockWikiSnapshot({
    key,
    profile
  });
  const actor = getFakeSession(input.actor);
  const access = evaluateEditAccess(actor, snapshot.page.protectionLevel);

  if (!actor || access.mode !== "can_edit") {
    throw new Error(access.message);
  }

  const summary = input.summary.trim();
  const contentMarkdown = input.contentMarkdown.trim();

  if (!summary) {
    throw new Error("Edit summary is required");
  }

  if (!contentMarkdown) {
    throw new Error("Proposed content is required");
  }

  const draft = savePendingEditDraft({
    authorId: actor.userId,
    contentMarkdown,
    market: key.market,
    pageKey: profile.canonicalPageKey,
    summary,
    ticker: key.ticker,
    title: profile.name
  });

  return {
    actor,
    canonicalPath: `/stocks/${key.market.toLowerCase()}/${key.ticker}`,
    intentId: draft.intentId,
    revisionId: draft.revisionId,
    status: "pending"
  };
}

function normalizeStockKey(input: StockKey): StockKey {
  return {
    market: input.market.toUpperCase(),
    ticker: input.ticker.toUpperCase()
  };
}
