import { expect, test } from "@playwright/test";

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: {
    width: 390,
    height: 844,
  },
});

test("shows the built dashboard smoke path on mobile", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("market-card")).toBeVisible();

  const mingquanSegmentCard = page
    .getByTestId("segment-grid")
    .locator(".segment-card")
    .filter({ hasText: "鸣泉花园" })
    .first();

  await expect(mingquanSegmentCard).toBeVisible();
  await expect(
    mingquanSegmentCard.getByRole("heading", {
      name: "两居 87-90㎡",
    }),
  ).toBeVisible();

  await expect(page.getByRole("link", { name: "新增一条样本" })).toBeVisible();
});
