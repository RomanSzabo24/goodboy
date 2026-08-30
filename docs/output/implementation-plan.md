# Implementation Plan — GoodBoy Foundation (donation form)

> **How to use this document:** it's a living checklist. When a task is done, `- [ ]` becomes `- [x]`.
> If something turns out differently during implementation, edit or add the task right here — the plan should always match the actual state of the repo.
>
> Legend: `- [ ]` not done · `- [x]` done · 🟡 in progress / partial · ⭐ nice-to-have (bonus from the assignment) · 📍 suggested commit point
>
> **Commit convention:** small, working commits per checkpoint (Conventional Commits style: `feat:`, `fix:`, `chore:`, `test:`, `docs:`). Only commit at a 📍 marker once the preceding tasks build/lint clean — never commit a broken intermediate state.

**State as of 2026-08-29:** Phases 0–1 are committed (`chore: install core dependencies and configure tooling`, `feat: base app structure, providers and layout`). Phases 2–4 and most of 5–6 were implemented in the same working session but landed in that second commit too — this document's checklist state didn't get updated at the time, which is corrected now. Phases 0–4 and most of 5–6 are functionally implemented and verified (`typecheck`, `lint`, `test`, `test:e2e`, `build` all green; the full donation flow and Contact page were also exercised manually in a browser). **Phase 1.5 (Figma assets/tokens/visual parity) was skipped entirely** — the UI was built from `CLAUDE.md`'s business rules and shadcn/Tailwind defaults, not against the actual Figma frames, so it is not yet visually verified 1:1 against the design file. **The language open question is now resolved:** the app uses `next-intl` with Slovak as the default locale and English as a switchable secondary locale (routed via a `[locale]` segment, see Phase 9). All UI copy and Zod validation messages are localized through message catalogs; several accessibility/polish items from Phases 7–10 remain outstanding. See the per-phase notes below for exact deviations. Nothing has been committed yet beyond the two commits above — awaiting manual review/commit by the repo owner.

---

## Progress overview

| # | Phase | Status |
|---|-------|--------|
| 0 | Dependency & tooling setup | ✅ 6 / 6 |
| 1 | Base structure and providers | 🟡 4 / 5 |
| 1.5 | Figma: assets, tokens and components | ⬜ 0 / 9 (skipped) |
| 2 | Data layer (services + Zod + Query hooks) | 🟡 3 / 7 (restructured — see notes) |
| 3 | Form validation schemas | ✅ 7 / 7 |
| 4 | Form state (Zustand + RHF) | ✅ 4 / 4 (with noted deviations) |
| 5 | UI — form steps | 🟡 7 / 10 |
| 6 | Submission, results, Contact page | 🟡 6 / 7 |
| 7 | Accessibility and responsiveness | 🟡 1 / 6 |
| 8 | Tests | 🟡 4 / 6 |
| 9 | Bonuses ⭐ | 🟡 2 / 6 (+1 partial) |
| 10 | Final check and handover | 🟡 3 / 6 |

---

## Phase 0 — Dependency & tooling setup

- [x] Install runtime dependencies: `@tanstack/react-query`, `@tanstack/react-query-devtools`, `react-hook-form`, `@hookform/resolvers`, `zod`, `zustand` (zod pinned to v4 — npm resolved v3 by default)
- [x] Initialize shadcn/ui via CLI (`npx shadcn@latest init -t next -b radix -p nova -y`) — Radix primitives backend confirmed (`button.tsx` imports from `radix-ui`, `components.json` → `"style": "radix-nova"`); produces `components.json` + `src/lib/utils.ts`
- [x] Generate the base shadcn components: `button`, `input`, `label`, `select`, `checkbox`, `radio-group`, `card`, `sonner` (toast), `skeleton` — **deviation:** `form` no longer exists in this shadcn CLI/registry version (resolves to an empty registry entry); installed `field` instead, the current registry's RHF-integration primitive (`Field`, `FieldLabel`, `FieldError`, etc.), plus its `separator` dependency. Also later added `toggle` + `toggle-group` (Radix-backed, confirmed) for the preset-amount picker.
- [x] Set up Vitest + React Testing Library (`vitest.config.ts`, `vitest.setup.ts`, jsdom) + `test` script — `@vitejs/plugin-react` pinned to `^4` (v6 has a peer-dep conflict with shadcn's Babel 7 dependency)
- [x] Set up Playwright (`playwright.config.ts`, `e2e/` directory) + `test:e2e` script — chromium browser installed
- [x] Add `package.json` scripts: `test`, `test:watch`, `test:e2e`, `typecheck`

**Verification:** `npm run build`, `npm run lint`, `npm run test`, `npm run test:e2e` all pass. (Also moved `shadcn` from `dependencies` to `devDependencies` — it's a build-time CLI, not a runtime dep.)

> 📍 **Commit:** `chore: install core dependencies and configure tooling`

---

## Phase 1 — Base structure and providers

- [x] Create the target directory structure per the `project-structure` skill (`components/`, `services/`, `hooks/`, `stores/`, `lib/validations/`) — **deviation:** no `types/` folder was created; every type is derived via `z.infer`/`z.input`/`z.output` from the Zod schemas or from service return types, so a separate types directory had nothing to hold
- [x] `src/app/providers.tsx` — `'use client'` wrapper with `QueryClientProvider` (`QueryClient` in `useState`, `staleTime: 60_000`) — also added `next-themes`' `ThemeProvider` (needed by the generated `sonner.tsx`'s `useTheme()` call) — **deviation:** React Query Devtools were **not** wired in, even though the package is installed
- [x] Wired `Providers` + `Toaster` into `src/app/[locale]/layout.tsx`, added a `SiteHeader` with Home/Contact nav — **resolved:** `lang` is now set dynamically per-locale (`sk`/`en`) via `next-intl`; see Phase 9's i18n bonus for the full localization setup. The app moved under a `src/app/[locale]/` segment with `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`) handling locale routing.

> 📍 **Commit:** `feat: base app structure, providers and layout` 

---

## Phase 1.5 — Figma: assets, tokens and components

**Status: skipped in this pass.** No `figma-design-to-code`/`figma-use` MCP calls were made and no Figma data (frames, tokens, assets, screenshots) was pulled at all. The UI was implemented directly from `CLAUDE.md`'s written business rules plus shadcn/Tailwind defaults. This satisfies the functional requirements but **not** the assignment's visual-fidelity goal ("the UI must look 1:1 like Figma") — every box below is still open:

### Assets (images, icons, logo)

- [ ] Walk the Figma file via `get_metadata` and list every image, illustration, icon and logo used in the design
- [ ] Download assets via `download_assets` into `public/` (logo, step illustrations, SK/CZ flags, icons, any backgrounds); rasters at 1× and 2×, vectors as SVG
- [ ] Normalize naming and structure under `public/` (e.g. `public/images/`, `public/icons/`) — kebab-case filenames
- [ ] Use `next/image` with correct `width`/`height`/`alt`; SVG icons as components or inline, never as `<img>` without alt
- [ ] Verify no image is substituted by a placeholder or emoji — everything comes from Figma — **currently violated:** the SK/CZ country picker uses the 🇸🇰/🇨🇿 flag emoji (which even renders as plain "SK"/"CZ" text on Windows, no real flag glyph) instead of a Figma-sourced flag asset, and `lucide-react` icons (`PawPrint`, `HeartHandshake`, etc.) stand in for whatever iconography Figma actually specifies

> 📍 **Commit:** `chore: add Figma assets (images, icons, logo)` (not yet made)

### Design tokens and components

- [ ] Pull variables via `get_variable_defs` (colors, spacing, typography, radii) and port them 1:1 into `@theme` in `globals.css` — no hardcoded hex/px values in components
- [ ] Map the components from the Figma pages onto code components — one Figma component = one reusable component in `src/components/`, with the same variants and states (default / hover / focus / disabled / error)
- [x] Genuinely share the same components across screens (buttons, inputs, cards, badges, stepper) — this part holds regardless of Figma: all steps reuse the same shadcn primitives (`Button`, `Card`, `Field*`, `Input`, `Select`, `RadioGroup`, `Checkbox`, `ToggleGroup`) via props/variants, no copy-pasted variants
- [ ] Visually diff every screen against `get_screenshot` and against the running app in the browser, then fix the deviations

> 📍 **Commit:** `feat: design tokens and shared UI components from Figma` (not yet made)

**Note:** Figma defines the *look*; business rules (field lengths, required/optional, phone format, consent) follow `CLAUDE.md`. If they conflict, `CLAUDE.md` wins and the discrepancy gets reported. (No conflict was found because Figma was never checked — this needs to happen before the visual-parity work above can start.)

---

## Phase 2 — Data layer

Base URL: `https://frontend-assignment-api.goodrequest.dev`, endpoints per [openapi.json](../input/openapi.json).

- [ ] `src/lib/api-client.ts` — **not created as a separate file.** The three `fetch` calls live directly in `src/services/shelters.ts` (`getShelters`, `getSheltersResults`, `postContribute`), each throwing a plain `Error` on a non-`ok` response. There is no shared/typed `ApiError` or a single fetch-wrapper abstraction — acceptable for 3 endpoints, but would need extracting if the API surface grows.
- [ ] `src/lib/validations/api.ts` — **not created.** Response shapes (`SheltersResponse`, `ResultsResponse`, `ContributeResponse`) are plain hand-written TypeScript `type`s in `src/services/shelters.ts`, not Zod schemas, so API responses are **not runtime-validated** via `safeParse` anywhere. This is a real gap vs. both this plan and the `api-integration`/`zod-validation` skills' guidance ("never a type assertion... parse it through a Zod schema"). Flagged as a follow-up.
- [x] `src/services/shelters.ts` — `getShelters(search?)`, `getSheltersResults(search?)`, `postContribute(body)`, plus `toContributeBody()` (form → API payload mapping) and `getContributeError()` (extracts the first `ERROR` message from `messages[]`) — **deviation:** no `safeParse` (see above)
- [x] `src/hooks/use-shelters.ts` — contains **all three** hooks (`useShelters`, `useSheltersResults`, `useContribute`) in one file with a shared `sheltersKeys` query-key factory, rather than the three separate files the plan sketched (`use-shelters.ts` / `use-results.ts` / `use-contribute.ts`). Kept together because they share the same key factory and it's a small surface; split them out if the hooks grow.
- [ ] `src/hooks/use-results.ts` — merged into `use-shelters.ts` (see above)
- [ ] `src/hooks/use-contribute.ts` — merged into `use-shelters.ts` (see above)
- [x] Form data → API payload mapping in one place, as a testable pure function — `toContributeBody()`, unit-tested in `src/services/shelters.test.ts`

**Note:** the optional-first-name-vs-required-`firstName` mismatch (see Open questions) is resolved in `toContributeBody`: `firstName: name ?? ""`.

> 📍 **Commit:** `feat: data layer - api client, response schemas, query hooks` (not yet made — and per the gaps above, doesn't fully match its own name yet: no dedicated api-client, no response schemas)

---

## Phase 3 — Form validation schemas (Zod v4)

- [x] `helpType`: enum `GIFT_FOUNDATION` | `GIFT_SHELTER`
- [x] `shelterId`: optional for `GIFT_FOUNDATION`, **required** for `GIFT_SHELTER` — implemented via `.refine()` on the whole object with `path: ["shelterId"]`, not `.superRefine()` (equivalent outcome for a single cross-field condition; `superRefine` would only be needed for multiple related issues at once)
- [x] `amount`: required positive number — kept as `z.number().positive()` (not `z.coerce.number()`, see rationale below) with the number `<input>` registered via RHF's `valueAsNumber: true`; an empty/non-numeric input becomes `NaN`, which fails `.positive()` and surfaces the "Amount must be greater than 0" message rather than a raw type error
- [x] Personal details: `name` optional 2–20 chars (empty string → `undefined` via `.refine()` + `.transform()`, tested explicitly for the `""` edge case), `surname` required 2–30, `email` required and valid (`z.email()`, Zod v4 top-level form)
- [x] `phone`: SK `+421` / CZ `+420` format — **deviation:** implemented as a **single combined schema** (`skCzPhoneSchema`, one regex over the full `"+421 900 000 000"` string) rather than "separate schema + normalization before submit." The `PhoneInput` component itself splits/recombines prefix + national number for display, so the country-flag UI and the single-string schema stay in sync by construction; no separate normalization step was needed.
- [x] `consent`: **deviation:** `z.boolean().refine(v => v === true)` instead of `z.literal(true)`. Reason: `z.literal(true)` makes the *input* type of the field also `true`, which makes it impossible to type a legitimate unchecked (`false`) default value for the checkbox without an unsafe cast. `z.boolean().refine(...)` keeps `false` as a valid default while still failing validation until the box is checked.
- [x] Slovak error messages for all rules — **done via the Phase 9 i18n bonus.** `donation.ts` exports `createDonationFormSchema(messages: ValidationMessages)` / `createContributorSchema` / `createPhoneSchema` factories instead of static schemas; `DonationForm` builds the schema with `useTranslations("validation")` strings memoized via `useMemo`. The plain `donationFormSchema`/`contributorSchema`/`skCzPhoneSchema` exports still exist (built from `defaultValidationMessages`, English) purely so `donation.test.ts` and the `HelpTypeStep` test harness don't need a translation context to exercise validation logic — they're not used by the running app.

> 📍 **Commit:** `feat: form validation schemas (Zod)` (not yet made)

---

## Phase 4 — Form state

- [x] `src/stores/donation-form-store.ts` (Zustand) — holds only `step` + `goToStep`/`goNext`/`goBack`/`reset`; **deviation:** does not also hold "the in-progress data" — form field values live solely in the single `useForm` instance in `DonationForm`, which is fine since the whole multi-step flow is one mounted component (no unmount/remount between steps that would lose RHF state)
- [x] A single `useForm` with `zodResolver` across all steps — **deviation:** `mode: "onBlur"` rather than `mode: "onTouched"` (both satisfy "clearly notify the user of errors" without shouting mid-keystroke; `onTouched` would additionally re-show an error while still focused after a blur — a minor UX difference, easy to switch if preferred)
- [x] Per-step validation (`form.trigger([...fieldsForThisStep])`) — implemented via a `STEP_FIELDS` map keyed by step name; no advancing without passing validation
- [x] Reset both form and store after a successful submission — **implemented as user-initiated**, not automatic: on success the flow shows a confirmation screen with the API's `messages[]`, and `form.reset()` + store `reset()` only fire when the user clicks "Make another donation." (Kept deliberately so the confirmation screen doesn't blank out immediately.)

> 📍 **Commit:** `feat: multi-step form state (Zustand + RHF)` (not yet made)

---

## Phase 5 — UI: form steps

- [x] Step indicator (progress) — hand-rolled `StepIndicator` (numbered circles + connecting line); **not verified against Figma** (see Phase 1.5)
- [x] Step 1 — help type selection (`GIFT_FOUNDATION` / `GIFT_SHELTER`) as radio "cards" — `RadioGroupItem` wrapped in `FieldLabel`+`Field`, which shadcn's own CSS turns into a bordered/hoverable card
- [x] Step 1 — shelter selection (`Select`) — 🟡 **deviation:** bound to a **server-fetched** `shelters` prop (fetched once in the `page.tsx` Server Component and passed down), not to the client `useShelters()` hook. That means there's currently **no client-side loading skeleton, no error fallback, and no explicit empty-list state** for the shelter picker — if the server-side fetch fails, Next's error boundary shows a generic error page instead of a graceful in-form fallback. `useShelters()` exists and is ready to use if this needs to become a client-fetched, re-searchable list later (see the Phase 9 shelter-search bonus).

> 📍 **Commit:** `feat(form): step indicator and help-type/shelter step` (not yet made)

- [x] Step 2 — preset amounts (`ToggleGroup`, 5/10/25/50 €) + custom amount input, kept in sync both ways (picking a preset updates the number input and vice versa) — **note:** preset values/copy are placeholders, not sourced from Figma (see Open questions)

> 📍 **Commit:** `feat(form): amount step` (not yet made)

- [x] Step 3 — personal details (name, surname, email)
- [x] Step 3 — phone with +421/+420 country-code picker and country flag (`PhoneInput`)
- [x] Step 3 — consent checkbox for personal data processing
- [x] ⭐ (bonus, done ahead of Phase 9) multi-donor support via `useFieldArray` — add/remove donor rows, each with its own name/surname/email/phone/consent

> 📍 **Commit:** `feat(form): personal details step (name, phone, consent)` (not yet made)

- [x] Field-level error display — `FieldError` under every input, `aria-invalid` set, `data-invalid` on the wrapping `Field` for styling
- [ ] Error summary on submit attempt — **not done**; only per-field messages exist, there is no aggregated "N errors" summary block
- [ ] Transitions/animations between steps — **not done.** Steps swap instantly with no animation. This is explicitly called out as rewarded in the assignment and is a clear follow-up (e.g. a simple fade/slide via `tw-animate-css`, which is already installed).
- [ ] Every step compared against its Figma screenshot — **not done** (Phase 1.5 was skipped)

> 📍 **Commit:** `feat(form): error summary, step transitions and Figma visual polish` (not yet made — and not yet earned, since the error summary and transitions aren't built)

---

## Phase 6 — Submission, results, Contact page

- [x] Form submission via `useContribute`, disabled + loading button state (`contribute.isPending` → button disabled, label "Submitting…")
- [x] Success state (confirmation screen listing the API's `messages[]`) + invalidation of the `["shelters","results"]` query on success
- [x] Error state — both a network/thrown-error catch (generic toast) and an explicit `messages[].type === "ERROR"` check (`getContributeError`) that shows the real API error message and does **not** transition to the success step

> 📍 **Commit:** `feat: form submission with success/error states` (not yet made)

- [x] "Total raised + donor count" widget (`ResultsSummary`) bound to `useSheltersResults` (client, `refetchInterval: 30_000`) seeded with a server-fetched `initialData` prop; currency formatted via `Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" })`
- [ ] Loading skeleton and error fallback for the widget — 🟡 **partial by design, not fully done:** because the page always passes real `initialData` from the server, there's no loading flash to cover — but there's also **no visible error state** if the client-side refetch fails; it silently keeps showing the last good (or initial) data with no indicator to the user

> 📍 **Commit:** `feat: totals/donor-count results widget` (not yet made)

- [x] `/contact` page with the organization's contact details (Server Component, static)
- [x] Navigation between the form and the contact page (`SiteHeader`)

> 📍 **Commit:** `feat: Contact page and navigation` (not yet made)

---

## Phase 7 — Accessibility and responsiveness

- [ ] Correct `label`/`htmlFor` and `aria-invalid` — **done**; `aria-describedby` pointing at the error message's own id — **not done** (`FieldError` renders a `role="alert"` region but inputs aren't wired to it via `aria-describedby`, so the association relies on the error appearing visually near the field rather than being programmatically linked)
- [ ] Full keyboard operation of the whole flow — 🟡 **likely true, not manually verified.** Radix primitives (`RadioGroup`, `Select`, `Checkbox`, `ToggleGroup`) are keyboard-operable by default, but no explicit keyboard-only walkthrough was done in this pass (manual QA was mouse/click-driven via the browser tool).
- [ ] Focus management on step change, and focus moved to the first error — **not done.** No `.focus()` call moves focus into the new step's heading/first field on `goNext`/`goBack`, and a failed `form.trigger()` doesn't move focus to the first invalid field.
- [ ] Contrast and a visible focus ring per WCAG — 🟡 relies entirely on shadcn's default `focus-visible:ring-*` styles and its default color tokens; **not independently checked** against WCAG contrast ratios.
- [x] Mobile-first Tailwind classes per the `mobile-first-design` skill — base (unprefixed) classes are mobile, `sm:`/breakpoint variants layer on top throughout (e.g. `grid gap-4 sm:grid-cols-2`, `hidden ... sm:inline`)
- [ ] Verify layout at 375 / 768 / 1440 px against Figma — **not done.** A resize-and-screenshot attempt during manual QA didn't actually change the rendered viewport (tooling limitation in this session), and there's no Figma reference to check against anyway (Phase 1.5 skipped).

---

## Phase 8 — Tests

- [x] Unit tests for the Zod schemas — `src/lib/validations/donation.test.ts`: phone (+421/+420 accepted, +48 and no-code rejected), name (empty passes, 1/21 chars fail), surname boundaries, invalid email, consent `false` rejected, amount zero/negative/positive, both branches of the `shelterId` refine
- [x] Unit test for the form → API payload mapping — `src/services/shelters.test.ts`: `GIFT_FOUNDATION`→`shelterID: null`, `GIFT_SHELTER`→chosen id, absent name → `firstName: ""`, plus `getContributeError` (no `ERROR` → `undefined`; `ERROR` present despite HTTP 200 → returned)
- [ ] Component tests for the steps (RTL): error rendering, blocked navigation to the next step — 🟡 **partial.** `src/components/donation-form/help-type-step.test.tsx` covers the conditional shelter-picker (shows/hides based on `helpType`), but there is **no** component test asserting an error renders inline in `AmountStep`/`PersonalDetailsStep`, and no test asserting that an invalid step actually blocks `goNext()`.
- [ ] Component test for the results widget with a mocked fetch (MSW or a mocked service) — **not done.** No test exists for `ResultsSummary`/`useSheltersResults`.

> 📍 **Commit:** `test: unit and component tests for schemas, mapping and steps` (not yet made — and per the gaps above, not fully earned)

- [x] E2E happy path (Playwright) — `e2e/donation-flow.spec.ts`: general donation → preset amount → fill details → submit → confirmation screen, with only `POST /contribute` stubbed (the two `GET`s hit the real, read-only API)
- [ ] E2E validation scenario: empty required fields → errors, cannot advance — **not done as a distinct test.** The current e2e suite has the happy path plus an API-level `ERROR`-message scenario, but nothing exercising client-side "submit with empty/invalid fields → blocked, errors shown."

> 📍 **Commit:** `test: e2e happy path and validation scenario (Playwright)` (not yet made — validation scenario missing)

---

## Phase 9 — Bonuses ⭐

> Bonuses are independent of each other — implement any subset, in any order. 📍 Commit each one separately right after it's done, so the base submission stays clean even if a bonus is dropped later.

- [x] ⭐ String localization (i18next / next-intl) — **done with `next-intl`**, Slovak default + English secondary locale via a `[locale]` App Router segment:
  - `src/i18n/routing.ts` (`locales: ["sk", "en"]`, `defaultLocale: "sk"`, `localeDetection: false` — always defaults to Slovak instead of negotiating the browser's `Accept-Language`, since the target audience is Slovak/Czech; language only changes via the in-app switcher), `src/i18n/navigation.ts` (localized `Link`/`usePathname`/`useRouter`), `src/i18n/request.ts` (loads `messages/{locale}.json`)
  - `src/proxy.ts` — locale-routing proxy (Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`; see the [proxy file convention docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy))
  - `src/app/[locale]/{layout,page,contact/page}.tsx` — moved under the locale segment; `generateStaticParams`/`generateMetadata`/`setRequestLocale` wired per next-intl's App Router guide
  - `messages/sk.json` + `messages/en.json` — every UI string (nav, form steps, field labels, aria-labels, toasts, success screen, results widget, contact page, metadata)
  - `src/components/layout/language-switcher.tsx` — a `Select`-based switcher in `SiteHeader` that swaps locale while preserving the current path and in-progress form step
  - `src/lib/validations/donation.ts` — refactored from static schemas to `createDonationFormSchema(messages)`/`createContributorSchema`/`createPhoneSchema` factories so Zod error messages are localized too; `DonationForm` builds the schema via `useTranslations("validation")` + `useMemo`
  - `src/components/results/results-summary.tsx` — currency formatting now uses next-intl's `useFormatter()` (locale-aware) instead of a hardcoded `sk-SK` `Intl.NumberFormat`
  - Updated `e2e/donation-flow.spec.ts` (Slovak copy, since `/` now defaults to `sk`) and `help-type-step.test.tsx` (wrapped in `NextIntlClientProvider` with the English catalog) accordingly
  - 📍 `feat: i18n string localization (next-intl, sk/en)` (not yet committed)
- [ ] ⭐ SEO — 🟡 **partial:** static `export const metadata` (title + description) added for `/` and `/contact` via Next's Metadata API; **no** `generateMetadata` per form step (the steps are client-side state within one route, not separate routes, so per-step server metadata isn't straightforward without restructuring), and **no `og:image`** — 📍 `feat: SEO metadata and og:image`
- [x] ⭐ Multiple donors (`contributors[]`) via `useFieldArray` — **done**, add/remove donor rows in `PersonalDetailsStep` — 📍 `feat: multiple donors via useFieldArray` (not yet committed)
- [ ] ⭐ Search within the shelter list (`?search=` parameter with debounce) — **not done** (the `search` param is plumbed through `getShelters`/`useShelters` but nothing in the UI calls it) — 📍 `feat: debounced shelter search`
- [ ] ⭐ Donor list / richer results display — **not done**; `ResultsSummary` shows only the total + count, no donor list — 📍 `feat: richer results/donor list display`
- [ ] ⭐ Subtle animations and micro-interactions across the UI — **not done** — 📍 `feat: micro-interactions and animation polish`

---

## Phase 10 — Final check and handover

- [x] `npm run lint` — clean
- [x] `npm run build` — passes, no TS errors; no `any` used anywhere in the new code
- [x] `npm run test` and `npm run test:e2e` — green (28 unit/component tests, 3 e2e tests)
- [ ] README: project description, how to run it, decisions and deviations from the assignment — **not done**; `README.md` is still the default `create-next-app` boilerplate
- [ ] Manual walkthrough of the whole flow in the browser (mobile + desktop) — 🟡 **desktop only.** Full flow (help type → shelter picker validation → amount presets/custom → multi-donor add/remove → field validation → phone/consent) was walked through manually via the browser tool at desktop width; the actual final submission was deliberately **not** clicked for real (it would POST a real donation into the assignment's shared live database) — that path is instead covered by unit tests + the stubbed e2e tests. A mobile-viewport resize was attempted but didn't visibly change the render in this session, so mobile has not actually been eyeballed.
- [ ] Final visual side-by-side comparison of every screen against Figma, assets included — **not done** (Phase 1.5 skipped)

---

## Open questions / decisions

- [x] How to map the optional first name onto the required `firstName` in the API payload — **resolved:** `firstName: name ?? ""` in `toContributeBody` (`src/services/shelters.ts`)
- [ ] Exact preset amount values and copy — **still open/placeholder.** Shipped with 5 / 10 / 25 / 50 € as reasonable defaults, not taken from Figma.
- [x] Phone format sent to the API (`+421 900 000 000` vs. the `0900 000 000` example in the spec) — **resolved:** the app sends the full international format with country code, e.g. `"+421 900 123 456"` (matches the `skCzPhoneSchema` regex the form validates against), not the local `0900 000 000` style from the OpenAPI example.
- [x] Should the app's language be Slovak or English? — **resolved:** neither exclusively — the app is now localized with `next-intl` (Slovak default, English switchable), which resolves Phase 3's "Slovak error messages" item and doubles as the Phase 9 i18n bonus. See Phase 9 for the full implementation.
- [ ] **New open question:** should API responses be runtime-validated with Zod (`safeParse`), as both this plan and the `api-integration`/`zod-validation` skills recommend, or is compile-time typing considered sufficient for these 3 read/write endpoints?
