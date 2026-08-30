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

  // Step 1: help type, shelter (optional) and amount are all on one screen —
  // general donation is the default, just pick a preset amount.
  await page.getByRole("radio", { name: "10 eur" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();

  // Step 2: personal details.
  await page.getByLabel("Priezvisko").fill("Testovaci");
  await page.getByLabel("E-mailová adresa").fill("donor@example.com");
  await page.getByLabel("Telefónne číslo").fill("900 123 456");
  await page.getByRole("button", { name: "Pokračovať" }).click();

  // Step 3: confirmation — review summary and consent.
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
  await page.getByRole("radio", { name: "10 eur" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();

  await page.getByLabel("Priezvisko").fill("Testovaci");
  await page.getByLabel("E-mailová adresa").fill("donor@example.com");
  await page.getByLabel("Telefónne číslo").fill("900 123 456");
  await page.getByRole("button", { name: "Pokračovať" }).click();

  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page.getByRole("button", { name: "Prispieť" }).click();

  await expect(page.getByText("Something went wrong")).toBeVisible();
  await expect(page.getByText("Ďakujeme za váš príspevok!")).not.toBeVisible();
});

test("empty required fields block navigation and show inline errors on every step", async ({
  page,
}) => {
  // The API must never be reached — every attempt below is expected to be
  // blocked client-side before a request is ever sent.
  let contributeCalls = 0;
  await page.route(CONTRIBUTE_URL, async (route) => {
    contributeCalls++;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ messages: [{ type: "SUCCESS", message: "OK" }] }),
    });
  });

  await page.goto("/");

  // Step 1: amount defaults to 0 — continuing without picking one must stay
  // on this step and show the field's own error (matched by id, since the
  // same message is also echoed in the aggregated error summary above it).
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await expect(page.locator('[id="amount-error"]')).toHaveText("Suma musí byť väčšia ako 0");
  await expect(
    page.getByRole("heading", { name: "Vyberte si možnosť, ako chcete pomôcť" }),
  ).toBeVisible();

  // Fix step 1 and advance.
  await page.getByRole("radio", { name: "10 eur" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await expect(
    page.getByRole("heading", { name: "Potrebujeme od Vás zopár informácií" }),
  ).toBeVisible();

  // Step 2: surname, e-mail and phone are all mandatory and empty by default.
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await expect(page.locator('[id="contributors.0.surname-error"]')).toHaveText(
    "Priezvisko musí mať aspoň 2 znaky",
  );
  await expect(page.locator('[id="contributors.0.email-error"]')).toHaveText(
    "Zadajte platnú e-mailovú adresu",
  );
  await expect(page.locator('[id="contributors.0.phone-error"]')).toHaveText(
    "Zadajte platné slovenské (+421) alebo české (+420) telefónne číslo",
  );
  await expect(
    page.getByRole("heading", { name: "Potrebujeme od Vás zopár informácií" }),
  ).toBeVisible();

  // Fix step 2 and advance. The form validates in "onBlur" mode, so the
  // phone field (a custom Controller-driven component, unlike the plain
  // registered text inputs) only re-validates once it's actually blurred.
  await page.getByLabel("Priezvisko").fill("Testovaci");
  await page.getByLabel("E-mailová adresa").fill("donor@example.com");
  await page.getByLabel("Telefónne číslo").fill("900 123 456");
  await page.getByLabel("Telefónne číslo").press("Tab");
  await expect(page.locator('[id="contributors.0.phone-error"]')).toBeHidden();
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await expect(page.getByRole("heading", { name: "Skontrolujte si zadané údaje" })).toBeVisible();

  // Step 3: submitting without checking consent must not call the API.
  await page.getByRole("button", { name: "Prispieť" }).click();
  await expect(page.locator('[id="consent-error"]')).toHaveText(
    "Musíte súhlasiť so spracovaním osobných údajov",
  );
  await expect(page.getByRole("heading", { name: "Skontrolujte si zadané údaje" })).toBeVisible();
  await expect(page.getByText("Ďakujeme za váš príspevok!")).not.toBeVisible();
  expect(contributeCalls).toBe(0);
});
