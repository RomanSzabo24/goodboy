# Implementation Plan — GoodBoy Foundation (donation form)

> **How to use this document:** it's a living checklist. When a task is done, `- [ ]` becomes `- [x]`.
> If something turns out differently during implementation, edit or add the task right here — the plan should always match the actual state of the repo.
>
> Legend: `- [ ]` not done · `- [x]` done · 🟡 in progress · ⭐ nice-to-have (bonus from the assignment) · 📍 suggested commit point
>
> **Commit convention:** small, working commits per checkpoint (Conventional Commits style: `feat:`, `fix:`, `chore:`, `test:`, `docs:`). Only commit at a 📍 marker once the preceding tasks build/lint clean — never commit a broken intermediate state.

**State as of 2026-08-29:** Phase 0 complete — TanStack Query, RHF, Zod v4, Zustand and shadcn/ui (Radix/`radix-nova`) are installed; `src/components/ui/` has the base component set; Vitest + RTL and Playwright are configured and green. Not yet committed — awaiting manual review/commit by the repo owner. Next up: Phase 1 (base structure and providers).

---

## Progress overview

| # | Phase | Status |
|---|-------|--------|
| 0 | Dependency & tooling setup | ✅ 6 / 6 |
| 1 | Base structure and providers | ⬜ 0 / 5 |
| 1.5 | Figma: assets, tokens and components | ⬜ 0 / 9 |
| 2 | Data layer (services + Zod + Query hooks) | ⬜ 0 / 7 |
| 3 | Form validation schemas | ⬜ 0 / 6 |
| 4 | Form state (Zustand + RHF) | ⬜ 0 / 4 |
| 5 | UI — form steps | ⬜ 0 / 10 |
| 6 | Submission, results, Contact page | ⬜ 0 / 7 |
| 7 | Accessibility and responsiveness | ⬜ 0 / 6 |
| 8 | Tests | ⬜ 0 / 6 |
| 9 | Bonuses ⭐ | ⬜ 0 / 6 |
| 10 | Final check and handover | ⬜ 0 / 6 |

---

## Phase 0 — Dependency & tooling setup

- [x] Install runtime dependencies: `@tanstack/react-query`, `@tanstack/react-query-devtools`, `react-hook-form`, `@hookform/resolvers`, `zod`, `zustand` (zod pinned to v4 — npm resolved v3 by default)
- [x] Initialize shadcn/ui via CLI (`npx shadcn@latest init -t next -b radix -p nova -y`) — Radix primitives backend confirmed (`button.tsx` imports from `radix-ui`, `components.json` → `"style": "radix-nova"`); produces `components.json` + `src/lib/utils.ts`
- [x] Generate the base shadcn components: `button`, `input`, `label`, `select`, `checkbox`, `radio-group`, `card`, `sonner` (toast), `skeleton` — **deviation:** `form` no longer exists in this shadcn CLI/registry version (resolves to an empty registry entry); installed `field` instead, the current registry's RHF-integration primitive (`Field`, `FieldLabel`, `FieldError`, etc.), plus its `separator` dependency
- [x] Set up Vitest + React Testing Library (`vitest.config.ts`, `vitest.setup.ts`, jsdom) + `test` script — `@vitejs/plugin-react` pinned to `^4` (v6 has a peer-dep conflict with shadcn's Babel 7 dependency)
- [x] Set up Playwright (`playwright.config.ts`, `e2e/` directory) + `test:e2e` script — chromium browser installed
- [x] Add `package.json` scripts: `test`, `test:watch`, `test:e2e`, `typecheck`

**Verification:** `npm run build`, `npm run lint`, `npm run test`, `npm run test:e2e` all pass. (Also moved `shadcn` from `dependencies` to `devDependencies` — it's a build-time CLI, not a runtime dep.)

> 📍 **Commit:** `chore: install core dependencies and configure tooling`

---

## Phase 1 — Base structure and providers

- [ ] Create the target directory structure per the `project-structure` skill (`components/`, `services/`, `hooks/`, `stores/`, `lib/validations/`, `types/`)
- [ ] `src/app/providers.tsx` — `'use client'` wrapper with `QueryClientProvider` (QueryClient in `useState`, sensible `staleTime`) + Devtools in dev only
- [ ] Wire providers + `Toaster` into `src/app/layout.tsx`, set up fonts and `lang="sk"`
- [ ] Move Figma design tokens (colors, radii, typography) into `src/app/globals.css` via Tailwind v4 `@theme`
- [ ] Layout components (header with Home / Contact navigation, footer) in `src/components/layout/`

> 📍 **Commit:** `feat: base app structure, providers and layout`

---

## Phase 1.5 — Figma: assets, tokens and components

Source: **`My team Frontend-Assigment-2.0`**, file key `71F9aOieGNZNowSETLum7t` (not the older link in `assignment.md`).
Load the `figma-design-to-code` skill before any `get_design_context` / `get_screenshot` / `get_metadata` call, and `figma-use` before any `use_figma` write — see the `figma-design` skill.

**Goal: the UI must look 1:1 like Figma** — identical dimensions, spacing, colors, typography, radii, shadows and images. No "roughly similar" approximations.

### Assets (images, icons, logo)

- [ ] Walk the Figma file via `get_metadata` and list every image, illustration, icon and logo used in the design
- [ ] Download assets via `download_assets` into `public/` (logo, step illustrations, SK/CZ flags, icons, any backgrounds); rasters at 1× and 2×, vectors as SVG
- [ ] Normalize naming and structure under `public/` (e.g. `public/images/`, `public/icons/`) — kebab-case filenames
- [ ] Use `next/image` with correct `width`/`height`/`alt`; SVG icons as components or inline, never as `<img>` without alt
- [ ] Verify no image is substituted by a placeholder or emoji — everything comes from Figma

> 📍 **Commit:** `chore: add Figma assets (images, icons, logo)`

### Design tokens and components

- [ ] Pull variables via `get_variable_defs` (colors, spacing, typography, radii) and port them 1:1 into `@theme` in `globals.css` — no hardcoded hex/px values in components
- [ ] Map the components from the Figma pages onto code components — one Figma component = one reusable component in `src/components/`, with the same variants and states (default / hover / focus / disabled / error)
- [ ] Genuinely share the same components across screens (buttons, inputs, cards, badges, stepper) — if Figma shares them, the code must not duplicate them; handle variants via props, not by copy-paste
- [ ] Visually diff every screen against `get_screenshot` and against the running app in the browser (`run` / `claude-in-chrome` skills), then fix the deviations

> 📍 **Commit:** `feat: design tokens and shared UI components from Figma`

**Note:** Figma defines the *look*; business rules (field lengths, required/optional, phone format, consent) follow `CLAUDE.md`. If they conflict, `CLAUDE.md` wins and the discrepancy gets reported.

---

## Phase 2 — Data layer

Base URL: `https://frontend-assignment-api.goodrequest.dev`, endpoints per [openapi.json](../input/openapi.json).

- [ ] `src/lib/api-client.ts` — thin `fetch` wrapper (base URL, JSON, unified error messages, typed `ApiError`)
- [ ] `src/lib/validations/api.ts` — Zod response schemas:
  - `sheltersResponseSchema` → `{ shelters?: { id: number; name: string }[] }` (note: `shelters` is not `required` in the spec)
  - `resultsResponseSchema` → `{ contributors: number; contribution: number | null }`
  - `contributeResponseSchema` → `{ messages: { message: string; type: 'ERROR'|'WARNING'|'INFO'|'SUCCESS' }[] }`
- [ ] `src/services/shelters.ts` — `getShelters(search?)`, `getResults(search?)`, `postContribution(payload)`; every response goes through `safeParse`
- [ ] `src/hooks/use-shelters.ts` — `useShelters()` (TanStack Query, longer `staleTime`, list for the select)
- [ ] `src/hooks/use-results.ts` — `useResults()` (periodic `refetchInterval`, since the data updates continuously)
- [ ] `src/hooks/use-contribute.ts` — `useMutation` for POST `/api/v1/shelters/contribute`
- [ ] Form data → API payload mapping (`contributors[]`, `shelterID`, `value`) in one place, as a testable pure function

**Note:** the API treats `firstName` as required while the assignment makes the first name optional — the mapping must handle this (document the decision in code).

> 📍 **Commit:** `feat: data layer - api client, response schemas, query hooks`

---

## Phase 3 — Form validation schemas (Zod v4)

- [ ] `helpType`: enum `GIFT_FOUNDATION` | `GIFT_SHELTER`
- [ ] `shelterId`: optional for `GIFT_FOUNDATION`, **required** for `GIFT_SHELTER` (cross-field via `superRefine`, error targeted at `shelterId`)
- [ ] `value`: required positive number (presets + custom amount; empty string → validation error, not `NaN`)
- [ ] Personal details: `name` optional 2–20 chars, `surname` required 2–30, `email` required and valid
- [ ] `phone`: SK `+421` / CZ `+420` format, separate schema + normalization before submit
- [ ] `consent`: `z.literal(true)` with a custom message
- [ ] Slovak error messages for all rules; types derived via `z.infer`

> 📍 **Commit:** `feat: form validation schemas (Zod)`

---

## Phase 4 — Form state

- [ ] `src/stores/donation-form-store.ts` (Zustand) — current step, `next/prev/reset`, optionally the in-progress data
- [ ] A single `useForm` with `zodResolver` across all steps, `mode: 'onTouched'`
- [ ] Per-step validation (`trigger` over that step's fields) — no advancing without passing validation
- [ ] Reset both form and store after a successful submission

> 📍 **Commit:** `feat: multi-step form state (Zustand + RHF)`

---

## Phase 5 — UI: form steps

- [ ] Step indicator (progress) per Figma
- [ ] Step 1 — help type selection (`GIFT_FOUNDATION` / `GIFT_SHELTER`) as radio cards
- [ ] Step 1 — shelter selection (`Select` bound to `useShelters`), with loading / error / empty-list states

> 📍 **Commit:** `feat(form): step indicator and help-type/shelter step`

- [ ] Step 2 — preset amounts + custom amount input, kept in sync with each other

> 📍 **Commit:** `feat(form): amount step`

- [ ] Step 3 — personal details (name, surname, email)
- [ ] Step 3 — phone with +421/+420 country-code picker and country flag
- [ ] Step 3 — consent checkbox for personal data processing

> 📍 **Commit:** `feat(form): personal details step (name, phone, consent)`

- [ ] Field-level error display + error summary on submit attempt
- [ ] Transitions/animations between steps (explicitly rewarded in the assignment)
- [ ] Every step compared against its Figma screenshot (spacing, sizes, colors, images) and adjusted to match

> 📍 **Commit:** `feat(form): error summary, step transitions and Figma visual polish`

---

## Phase 6 — Submission, results, Contact page

- [ ] Form submission via `useContribute`, disabled + loading button state
- [ ] Success state (screen/toast per Figma) + invalidation of the `results` query
- [ ] Error state — clear message for both network failure and a `type: 'ERROR'` entry in the response

> 📍 **Commit:** `feat: form submission with success/error states`

- [ ] "Total raised + donor count" widget bound to `useResults`, currency formatted in `sk-SK`
- [ ] Loading skeleton and error fallback for the widget

> 📍 **Commit:** `feat: totals/donor-count results widget`

- [ ] `/contact` page with the organization's contact details (Server Component)
- [ ] Navigation between the form and the contact page

> 📍 **Commit:** `feat: Contact page and navigation`

---

## Phase 7 — Accessibility and responsiveness

- [ ] Correct `label` / `htmlFor`, `aria-invalid`, `aria-describedby` pointing at error messages
- [ ] Full keyboard operation of the whole flow (including radio cards and the select)
- [ ] Focus management on step change, and focus moved to the first error
- [ ] Contrast and a visible focus ring per WCAG
- [ ] Mobile-first Tailwind classes per the `mobile-first-design` skill (base = mobile, `md:`/`lg:` on top)
- [ ] Verify layout at 375 / 768 / 1440 px against Figma


---

## Phase 8 — Tests

- [ ] Unit tests for the Zod schemas (shelter required for `GIFT_SHELTER`, SK/CZ phone, name/surname lengths, consent)
- [ ] Unit test for the form → API payload mapping
- [ ] Component tests for the steps (RTL): error rendering, blocked navigation to the next step
- [ ] Component test for the results widget with a mocked fetch (MSW or a mocked service)

> 📍 **Commit:** `test: unit and component tests for schemas, mapping and steps`

- [ ] E2E happy path (Playwright): fill in all steps through to a successful submission
- [ ] E2E validation scenario: empty required fields → errors, cannot advance

> 📍 **Commit:** `test: e2e happy path and validation scenario (Playwright)`

---

## Phase 9 — Bonuses ⭐

> Bonuses are independent of each other — implement any subset, in any order. 📍 Commit each one separately right after it's done, so the base submission stays clean even if a bonus is dropped later.

- [ ] ⭐ String localization (i18next / next-intl) — 📍 `feat: i18n string localization`
- [ ] ⭐ SEO: `generateMetadata`, `og:image`, distinct titles/descriptions for the steps and Contact — 📍 `feat: SEO metadata and og:image`
- [ ] ⭐ Multiple donors (`contributors[]` — the API already supports it, add/remove a donor via `useFieldArray`) — 📍 `feat: multiple donors via useFieldArray`
- [ ] ⭐ Search within the shelter list (`?search=` parameter with debounce) — 📍 `feat: debounced shelter search`
- [ ] ⭐ Donor list / richer results display — 📍 `feat: richer results/donor list display`
- [ ] ⭐ Subtle animations and micro-interactions across the UI — 📍 `feat: micro-interactions and animation polish`

---

## Phase 10 — Final check and handover

- [ ] `npm run lint` — clean
- [ ] `npm run build` — passes, no TS errors, no `any` anywhere
- [ ] `npm run test` and `npm run test:e2e` — green
- [ ] README: project description, how to run it, decisions and deviations from the assignment
- [ ] Manual walkthrough of the whole flow in the browser (mobile + desktop)
- [ ] Final visual side-by-side comparison of every screen against Figma, assets included

---

## Open questions / decisions

- [ ] How to map the optional first name onto the required `firstName` in the API payload
- [ ] Exact preset amount values and copy — to be taken from Figma
- [ ] Phone format sent to the API (`+421 900 000 000` vs. the `0900 000 000` example in the spec)
