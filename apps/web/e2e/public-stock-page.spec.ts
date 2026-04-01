import { expect, test } from "@playwright/test";

test("renders the public stock page read model", async ({ page }) => {
  await page.goto("/stocks/krx/005930");

  await expect(page.getByText("Phase 4 Citation Policy Slice")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Samsung Electronics" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "System Data" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Approved Wiki" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Discussion Preview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trust & Sources" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "References" })).toBeVisible();
  await expect(page.getByPlaceholder("Search placeholder for aliases, filings, and related pages")).toBeVisible();
});

test("renders a second fixture-backed stock page", async ({ page }) => {
  await page.goto("/stocks/krx/000660");

  await expect(page.getByRole("heading", { name: "SK hynix" })).toBeVisible();
  await expect(page.getByText("198,500 KRW")).toBeVisible();
  await expect(page.getByText("Stale Snapshot")).toBeVisible();
  await expect(page.getByText("1 pending revision")).toBeVisible();
  await expect(page.getByRole("link", { name: "View Revision History" })).toBeVisible();
});

test("renders a visible noindex stock page fixture", async ({ page }) => {
  await page.goto("/stocks/krx/035420");

  await expect(page.getByRole("heading", { name: "NAVER" })).toBeVisible();
  await expect(page.getByText(/^Noindex$/)).toBeVisible();
});

test("returns the next not-found page for missing stock fixtures", async ({ page }) => {
  const response = await page.goto("/stocks/krx/999999");

  expect(response?.status()).toBe(404);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

test("renders the stock history page with approved and pending revisions", async ({ page }) => {
  await page.goto("/stocks/krx/000660/history");

  await expect(page.getByRole("heading", { name: "Revision History" })).toBeVisible();
  await expect(page.getByText("phase 2 pending revision")).toBeVisible();
  await expect(page.getByText("approved revision")).toBeVisible();
  await expect(page.getByText("Citations: 1")).toBeVisible();
  await expect(page.getByRole("link", { name: "Compare Approved vs Latest" })).toBeVisible();
});

test("renders the stock diff page for approved vs pending revisions", async ({ page }) => {
  await page.goto("/stocks/krx/000660/diff/rev-1...rev-2");

  await expect(page.getByRole("heading", { name: "Revision Diff" })).toBeVisible();
  await expect(page.getByText("changed line(s)")).toBeVisible();
  await expect(page.getByText(/^phase 2 pending revision$/)).toBeVisible();
  await expect(page.getByText("Source Policy: warning")).toBeVisible();
});

test("gates edit entry for anonymous and non-contributor users", async ({ page }) => {
  await page.goto("/stocks/krx/005930/edit");
  await expect(page.getByRole("heading", { name: "Login Required" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue To Demo Login" })).toBeVisible();
  await page.getByRole("link", { name: "Continue To Demo Login" }).click();
  await expect(page.getByRole("heading", { name: "Demo Login" })).toBeVisible();
  await page.getByRole("link", { name: "Continue As Contributor" }).click();
  await expect(page.getByRole("heading", { name: "Edit Proposal" })).toBeVisible();
  await expect(page.getByText("Citation Helper")).toBeVisible();

  await page.goto("/stocks/krx/005930/edit?actor=member-1");
  await expect(page.getByRole("heading", { name: "Contributor Access Required" })).toBeVisible();
});

test("completes the contributor edit to reviewer approval flow", async ({ page }) => {
  await page.goto("/stocks/krx/005930/edit?actor=contributor-1");

  await expect(page.getByRole("heading", { name: "Edit Proposal" })).toBeVisible();
  await page.getByLabel("Edit Summary").fill("phase 3 playwright pending revision");
  await page
    .getByLabel("Proposed Content")
    .fill("StockWiki Phase 3 playwright pending revision.\nSamsung Electronics contributor edit proposal.");
  await page.getByLabel("Financial Performance").check();
  await page.getByLabel("Citation 1 Label").fill("Samsung Electronics Q4 2025 earnings release");
  await page.getByLabel("Citation 1 URL").fill("https://example.test/filings/samsung-q4-2025");
  await page.getByLabel("Citation 1 Tier").selectOption("tier1");
  await page.getByLabel("Citation 1 Published Date").fill("2026-01-31");
  await page.getByLabel("Citation 1 Applies To").selectOption("financial-performance");
  await page.getByRole("button", { name: "Submit Edit Proposal" }).click();

  await expect(page.getByText("Pending revision submitted for reviewer queue.")).toBeVisible();
  await expect(page.getByText("Source policy state: clear")).toBeVisible();
  await page.getByRole("link", { name: "Back To Stock Page" }).click();

  await expect(page.getByText("1 pending revision")).toBeVisible();
  await expect(page.getByText("Samsung Electronics is used as the first read-only stock page slice.")).toBeVisible();
  await expect(page.getByText("playwright pending revision")).not.toBeVisible();
  await page.getByRole("link", { name: "View Revision History" }).click();
  await expect(page.getByText("phase 3 playwright pending revision")).toBeVisible();

  await page.goto("/review/mod-queue?actor=reviewer-1");
  await expect(page.getByRole("heading", { name: "Moderation Queue" })).toBeVisible();
  await expect(page.getByText("Source Policy Flags")).toBeVisible();
  await expect(page.getByText("phase 3 playwright pending revision")).toBeVisible();
  await page.getByRole("button", { name: "Approve Revision" }).click();

  await expect(page.getByText("Revision approved and public render updated.")).toBeVisible();
  await expect(page.getByText("edit_approved")).toBeVisible();
  await page.getByRole("link", { name: "Open Public Stock Page" }).click();

  await expect(page.getByText("Samsung Electronics contributor edit proposal.")).toBeVisible();
  await expect(page.getByText("0 pending revisions waiting for review.")).toBeVisible();
  await page.getByRole("link", { name: "View Revision History" }).click();
  await expect(page.getByText("phase 3 playwright pending revision")).toBeVisible();
  await expect(page.getByText(/^approved$/).first()).toBeVisible();
});

test("lets a reviewer reject a pending revision while public content stays unchanged", async ({ page }) => {
  await page.goto("/stocks/krx/035420/edit?actor=contributor-1");

  await page.getByLabel("Edit Summary").fill("phase 3 playwright rejected revision");
  await page
    .getByLabel("Proposed Content")
    .fill("StockWiki Phase 3 rejected revision.\nNAVER rejected revision should stay out of the public render.");
  await page.getByLabel("Governance & Risk").check();
  await page.getByRole("button", { name: "Submit Edit Proposal" }).click();

  await expect(page.getByText("Source policy state: flagged")).toBeVisible();
  await page.goto("/review/mod-queue?actor=reviewer-1");
  await expect(page.getByText("phase 3 playwright rejected revision")).toBeVisible();
  await expect(page.getByText("no_citation")).toBeVisible();
  await page.getByRole("button", { name: "Reject Revision" }).click();

  await expect(page.getByText("Revision rejected and kept out of the public render.")).toBeVisible();
  await expect(page.getByText("edit_rejected")).toBeVisible();
  await page.getByRole("link", { name: "Open Public Stock Page" }).click();

  await expect(page.getByText("NAVER is used to keep a visible but non-indexable public route in the read-only slice.")).toBeVisible();
  await expect(page.getByText("0 pending revisions waiting for review.")).toBeVisible();
  await expect(page.getByText("Phase 3 rejected revision")).not.toBeVisible();
});
