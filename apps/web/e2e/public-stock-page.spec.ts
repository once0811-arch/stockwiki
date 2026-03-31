import { expect, test } from "@playwright/test";

test("renders the public stock page read model", async ({ page }) => {
  await page.goto("/stocks/krx/005930");

  await expect(page.getByRole("heading", { name: "Samsung Electronics" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "System Data" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Approved Wiki" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Discussion Preview" })).toBeVisible();
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
  await expect(page.getByRole("link", { name: "Compare Approved vs Latest" })).toBeVisible();
});

test("renders the stock diff page for approved vs pending revisions", async ({ page }) => {
  await page.goto("/stocks/krx/000660/diff/rev-1...rev-2");

  await expect(page.getByRole("heading", { name: "Revision Diff" })).toBeVisible();
  await expect(page.getByText("changed line(s)")).toBeVisible();
  await expect(page.getByText(/^phase 2 pending revision$/)).toBeVisible();
});
