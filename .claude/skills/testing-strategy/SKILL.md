---
name: testing-strategy
description: Decide what to test and at which level (Vitest + React Testing Library unit/component vs. Playwright e2e), where test files live, and how to mock the donation API. Use whenever adding tests, setting up the test tooling, being asked whether something needs a test, or before claiming a change is verified.
---

# Testing strategy — GoodBoy Foundation

`CLAUDE.md` mandates **Vitest + React Testing Library** for unit/component tests and **Playwright** for e2e, verified with `npm run test` and `npm run test:e2e`.

**Current state: neither is installed.** `package.json` has only `dev`, `build`, `start`, `lint` — there is no `test` script, no `vitest.config.ts`, no `playwright.config.ts`. The first testing task must set the tooling up; don't report `npm run test` as passing when the script doesn't exist.

## Setup (first time)

Follow the official Next.js guides rather than improvising config — they're checked into `node_modules`:
- `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`
- `node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md`

Read them before writing config. Then add the scripts `CLAUDE.md` promises:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

Note the Next.js guides' caveat: Vitest + RTL cannot render **async Server Components**. Test those through Playwright e2e instead — don't fight the tooling.

## What to test at which level

| Concern | Level | Why |
|---|---|---|
| Zod schemas — field rules, cross-field `refine`, SK/CZ phone regex | Vitest, pure unit | Fastest, highest value; validation is the assignment's core logic. See [[zod-validation]] |
| `DonationFormValues` → API body mapping (`toContributeBody`) | Vitest, pure unit | Pure function; covers `GIFT_FOUNDATION` → `shelterID: null` |
| `contribute` response handling (`messages[].type === "ERROR"` on HTTP 200) | Vitest, unit | The single most error-prone API rule in this project — see [[api-integration]] |
| Individual form steps: renders, shows error text, disables/enables next | Vitest + RTL, component | Cheap and stable |
| Conditional logic: shelter required only when `GIFT_SHELTER` | Vitest + RTL, component | Business rule, testable without a browser |
| Accessibility wiring: label↔input association, error announced | Vitest + RTL | `getByLabelText` failing *is* the a11y assertion |
| Full happy path: pick help type → amount → details → submit → confirmation | Playwright e2e | Only real coverage of the multi-step Zustand flow |
| Server Components (Contact page, server-fetched shelter list) | Playwright e2e | RTL can't render async RSCs |
| Responsive layout at 375/768/1280 | Playwright e2e (viewport projects) | See [[mobile-first-design]] |

**Don't test**: shadcn/Radix primitives themselves (`src/components/ui/`) — they're third-party generated code. Test *your* composition of them.

## Placement

Per [[project-structure]]:
- Unit/component tests colocated: `src/lib/validations/donation.test.ts`, `src/components/donation-form/amount-step.test.tsx`.
- Playwright specs in a top-level `e2e/` directory — **not** under `src/`, and make sure Vitest's `include` excludes `e2e/` so it doesn't try to run Playwright specs.

## Mocking the API

Never let tests hit `frontend-assignment-api.goodrequest.dev` — it's a shared live endpoint, and a POST to `/contribute` writes real data into the assignment's totals.

- **Component/unit tests**: MSW (`msw` + `setupServer`) intercepting the three endpoints, or a `vi.mock` of `@/services/shelters`. Prefer MSW when the test exercises TanStack Query behaviour (loading/error/retry); a plain `vi.mock` is fine for pure logic.
- **Playwright**: `page.route()` to stub the endpoints. The submit-flow e2e in particular **must** stub `POST /api/v1/shelters/contribute` — never submit real donations from a test run.
- Fixture data belongs in one place (e.g. `src/test/fixtures.ts`), shaped from `docs/input/openapi.json`, so unit and e2e tests can't drift apart.

## Writing component tests

- Render with the providers the component actually needs (`QueryClientProvider` with `retry: false`, and a fresh `QueryClient` per test to avoid cache bleed). A shared `renderWithProviders` helper in `src/test/` beats repeating the wrapper.
- **Query by accessible role/label** (`getByRole`, `getByLabelText`), not `data-testid` — it doubles as the accessibility check `CLAUDE.md` requires.
- Drive inputs with `userEvent`, not `fireEvent` — react-hook-form validation modes depend on realistic focus/blur/change sequences.
- Assert on user-visible outcomes (the error message text, the button becoming enabled), not on internal form state.
- Validation runs async under RHF — use `await findBy*` / `waitFor` for error messages rather than a bare `getBy*`.

## Before claiming verification

Run `npm run lint` and `npm run build` (type-check) alongside the tests. If a test script doesn't exist yet, say so plainly rather than reporting a pass — per the honesty rule, a skipped step gets reported as skipped.
