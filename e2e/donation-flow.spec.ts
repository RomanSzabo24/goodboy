import { test, expect } from "@playwright/test";

// The shelters/results GETs are read-only and safe to hit for real, but the
// contribute POST writes into the assignment's shared totals — always stub it.
const CONTRIBUTE_URL = "**/api/v1/shelters/contribute";

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
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 2: amount — pick a preset.
  await page.getByRole("radio", { name: "10 euros" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 3: personal details.
  await page.getByLabel("Surname").fill("Testovaci");
  await page.getByLabel("E-mail").fill("donor@example.com");
  await page.getByLabel("Phone").fill("900 123 456");
  await page.getByRole("checkbox", { name: /consent/i }).check();

  await page.getByRole("button", { name: "Donate" }).click();

  await expect(page.getByText("Thank you for your donation!")).toBeVisible();
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
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: "10 euros" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Surname").fill("Testovaci");
  await page.getByLabel("E-mail").fill("donor@example.com");
  await page.getByLabel("Phone").fill("900 123 456");
  await page.getByRole("checkbox", { name: /consent/i }).check();
  await page.getByRole("button", { name: "Donate" }).click();

  await expect(page.getByText("Something went wrong")).toBeVisible();
  await expect(page.getByText("Thank you for your donation!")).not.toBeVisible();
});
