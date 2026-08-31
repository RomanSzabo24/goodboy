import { test, expect } from "@playwright/test";

// Runs only in the `mobile-chromium` Playwright project (Pixel 7 viewport) —
// see playwright.config.ts. Checks the layout doesn't overflow horizontally
// and that the full happy path still works with touch-sized targets.
const CONTRIBUTE_URL = "**/api/v1/shelters/contribute";

test("donation form has no horizontal overflow on a mobile viewport", async ({ page }) => {
  await page.goto("/");

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.getByRole("radio", { name: "10 eur" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();

  const detailsOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(detailsOverflow).toBe(false);
});

test("happy path completes end-to-end on a mobile viewport", async ({ page }) => {
  await page.route(CONTRIBUTE_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ type: "SUCCESS", message: "Príspevok bol úspešne zaznamenaný" }],
      }),
    });
  });

  await page.goto("/");

  await page.getByRole("radio", { name: "10 eur" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();

  await page.getByLabel("Priezvisko").fill("Testovaci");
  await page.getByLabel("E-mailová adresa").fill("donor@example.com");
  await page.getByLabel("Telefónne číslo").fill("900 123 456");
  await page.getByRole("button", { name: "Pokračovať" }).click();

  await page.getByRole("checkbox", { name: /súhlasím/i }).check();

  const submitButton = page.getByRole("button", { name: "Odoslať formulár" });
  await expect(submitButton).toBeVisible();
  // Footer/submit control must stay reachable and tappable on small screens.
  await expect(submitButton).toBeInViewport();
  await submitButton.click();

  await expect(page.getByText("Ďakujeme za váš príspevok!")).toBeVisible();
});
