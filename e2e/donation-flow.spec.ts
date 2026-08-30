import { test, expect } from "@playwright/test";

// The shelters/results GETs are read-only and safe to hit for real, but the
// contribute POST writes into the assignment's shared totals — always stub it.
const CONTRIBUTE_URL = "**/api/v1/shelters/contribute";

// Default locale is Slovak (sk) with no URL prefix — see src/i18n/routing.ts.
test("happy path: general donation, preset amount, submit succeeds", async ({ page }) => {
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

  // Step 1: help type — General donation is the default, just continue.
  await page.getByRole("button", { name: "Pokračovať" }).click();

  // Step 2: amount — pick a preset.
  await page.getByRole("radio", { name: "10 eur" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();

  // Step 3: personal details.
  await page.getByLabel("Priezvisko").fill("Testovaci");
  await page.getByLabel("E-mail").fill("donor@example.com");
  await page.getByLabel("Telefón").fill("900 123 456");
  await page.getByRole("checkbox", { name: /súhlasím/i }).check();

  await page.getByRole("button", { name: "Prispieť" }).click();

  await expect(page.getByText("Ďakujeme za váš príspevok!")).toBeVisible();
});

test("submission surfaces an ERROR message from the API instead of succeeding", async ({
  page,
}) => {
  await page.route(CONTRIBUTE_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ type: "ERROR", message: "Something went wrong" }],
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.getByRole("radio", { name: "10 eur" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();

  await page.getByLabel("Priezvisko").fill("Testovaci");
  await page.getByLabel("E-mail").fill("donor@example.com");
  await page.getByLabel("Telefón").fill("900 123 456");
  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page.getByRole("button", { name: "Prispieť" }).click();

  await expect(page.getByText("Something went wrong")).toBeVisible();
  await expect(page.getByText("Ďakujeme za váš príspevok!")).not.toBeVisible();
});
