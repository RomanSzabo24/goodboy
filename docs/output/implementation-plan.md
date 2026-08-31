# Implementation Plan — GoodBoy Foundation (donation form)

> **How to use this document:** it's a living checklist. When a task is done, `- [ ]` becomes `- [x]`.
> If something turns out differently during implementation, edit or add the task right here — the plan should always match the actual state of the repo.
>
> Legend: `- [ ]` not done · `- [x]` done · 🟡 in progress / partial · ⭐ nice-to-have (bonus from the assignment) · 📍 suggested commit point
>
> **Commit convention:** small, working commits per checkpoint (Conventional Commits style: `feat:`, `fix:`, `chore:`, `test:`, `docs:`). Only commit at a 📍 marker once the preceding tasks build/lint clean — never commit a broken intermediate state.

**State as of 2026-08-30:** Phases 0–1 are committed (`chore: install core dependencies and configure tooling`, `feat: base app structure, providers and layout`). Phases 2–4 and most of 5–6 were implemented in the same working session but landed in that second commit too — this document's checklist state didn't get updated at the time, which is corrected now. Phases 0–4 and most of 5–6 are functionally implemented and verified (`typecheck`, `lint`, `test`, `test:e2e`, `build` all green; the full donation flow and Contact page were also exercised manually in a browser). **Phase 1.5 (Figma assets/tokens/visual parity) is now done** — real Figma data (frames, variables, assets, screenshots) was pulled and the app was rebuilt to match, including a full information-architecture rework of the donation wizard to mirror Figma's actual 3-step flow (see Phase 1.5 notes below; this reshapes what Phases 3–6 originally described). **The language open question is now resolved:** the app uses `next-intl` with Slovak as the default locale and English as a switchable secondary locale (routed via a `[locale]` segment, see Phase 9). All UI copy and Zod validation messages are localized through message catalogs. **Phase 7 (accessibility) is now done** — `aria-describedby` wiring, focus management (step-change heading focus + focus-first-invalid-field on failed validation/submit), a full keyboard-only walkthrough, and a WCAG contrast audit (which found and fixed one real failure, `--muted-foreground`) were all completed and verified live in Chrome; see Phase 7 below for details. Some polish items from Phase 10 remained outstanding. See the per-phase notes below for exact deviations.

**Re-audit, 2026-08-31:** this document had drifted badly from the repo — `git log` now shows **36 commits** (`a37484a`..`dc14435`), not "the two commits above." The individual 📍 commit markers sprinkled through Phases 2–6 were never followed one-for-one; that work landed across two large commits instead (`76a2847` base build, `208f236` Figma rebuild) — those markers are now historical color, not a to-do list. Phases 7 onward *do* map to individual commits, noted per phase. Re-verified fresh in this pass: `npm run lint` (clean), `npm run test` (**51** tests passing, up from the 28 this doc last counted), `npm run test:e2e` (**4** tests passing — a `smoke.spec.ts` and a third `donation-flow.spec.ts` case, "submission surfaces an ERROR message," were added since), and `npm run build` (clean). Also found and fixed: a stale checkbox/text contradiction in Phase 5 (step transitions were marked done while the text said "not done" — they *are* done, landed later via Phase 9's animation commit), several "(not yet made/committed)" markers that were simply false once the actual commit log was checked, and an undocumented Docker build setup (not part of this plan at all — see the note at the end of Phase 10). The only real gap the whole plan had — the README — is now written.

---

## Progress overview

| # | Phase | Status |
|---|-------|--------|
| 0 | Dependency & tooling setup | ✅ 6 / 6 |
| 1 | Base structure and providers | 🟡 4 / 5 |
| 1.5 | Figma: assets, tokens and components | ✅ 9 / 9 |
| 2 | Data layer (services + Zod + Query hooks) | 🟡 4 / 7 (restructured — see notes) |
| 3 | Form validation schemas | ✅ 7 / 7 |
| 4 | Form state (Zustand + RHF) | ✅ 4 / 4 (with noted deviations) |
| 5 | UI — form steps (restructured — see notes) | ✅ 12 / 12 |
| 6 | Submission, results, Contact + About pages | ✅ 8 / 8 |
| 7 | Accessibility and responsiveness | ✅ 6 / 6 |
| 8 | Tests | ✅ 6 / 6 |
| 9 | Bonuses ⭐ | ✅ 4 / 4 |
| 10 | Final check and handover | ✅ 6 / 6 |

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

**Status: done.** Pulled the real file (`71F9aOieGNZNowSETLum7t`) via `get_metadata`/`get_design_context`/`get_variable_defs`/`get_screenshot`/`download_assets` and rebuilt the UI against it. This surfaced a structural mismatch, not just a visual one: Figma's actual 3-step wizard is **Výber útulku** (help-type segmented control + optional shelter select + amount picker, all on one screen) → **Osobné údaje** (personal details only) → **Potvrdenie** (a read-only review/summary screen + the single consent checkbox + submit) — different from the previously-built help-type/shelter → amount → personal-details+consent split with no review step. Given the size of that gap, the user was asked how far to reconcile it and chose the full rebuild; this is documented here since it reshapes Phases 3–6 below rather than only adding a visual coat of paint.

### Assets (images, icons, logo)

- [x] Walked the file via `get_metadata`/`get_screenshot` and identified every image/icon/logo actually used
- [x] Downloaded real assets via `download_assets` into `public/images/` (logo, contact "featured icon" badges, two hero photos — `hero-dog-beach.png` reused across all 3 form steps per Figma, `hero-dog-sunset.png` on the Contact page) and `public/icons/` (`flag-sk.svg`, pulled from the design)
- [x] Normalized naming to kebab-case under `public/images/` and `public/icons/`
- [x] Used `next/image` everywhere (`width`/`height` or `fill` + `sizes`, real `alt`); had to add `images.dangerouslyAllowSVG: true` in `next.config.ts` for the local flag SVGs
- [x] No more placeholder/emoji icons for anything Figma actually specifies — **one flagged exception:** Figma's file only mocks the SK flag (never shows a CZ state), so `public/icons/flag-cz.svg` was hand-authored to match the SK asset's circular-badge style. Flag geometry is a defined public-domain national symbol, not original iconography, so this doesn't violate the "everything comes from Figma" rule the way the emoji it replaces did. Generic/universal glyphs Figma doesn't brand distinctly (chevrons, checkmarks, the euro sign, the back-arrow) still come from `lucide-react`, consistent with the rest of the codebase — only the brand-specific iconography (logo, contact icons, flags, photos) was pulled from Figma.

### Design tokens and components

- [x] Pulled variables via `get_variable_defs` (colors, typography, spacing, container widths) and ported them into `globals.css`: `:root`'s `--background/--foreground/--primary/--secondary/--muted/--accent/--border/--input/--ring` now hold Figma's literal hex values (`#4F46E5` primary, `#F3F4F6` muted/field-fill, `#111827` foreground, etc.) instead of the generic shadcn OKLCH grayscale; added `--text-heading-lg`/`--text-heading-xl` theme tokens for the 48px/60px display sizes. Figma's 8/20/32/64px spacing and 1280px container width map exactly onto Tailwind's default spacing scale and `max-w-7xl`, so no custom spacing tokens were needed.
- [x] Swapped the Geist Sans font for Inter (`latin` + `latin-ext` subsets, the latter required for SK/CZ diacritics) to match every Figma typography token, which specifies Inter by name — **found and fixed a pre-existing bug** while at it: `--font-sans` in `globals.css` was self-referential (`--font-sans: var(--font-sans)`), so the app was silently falling back to the browser's default serif font this whole time, unrelated to which font was loaded.
- [x] Mapped Figma's components onto code: `Input`/`SelectTrigger` restyled to Figma's filled-field look (`bg-input`, borderless, `h-14`, `p-4`) shared across every field; a hand-styled segmented control (RadioGroup + sr-only inputs) replaces the old card-style help-type radios; the amount step got Figma's large underlined numeric input + 6-preset row (`5/10/20/30/50/100 €`, corrected from the placeholder `5/10/25/50`); `StepIndicator` rebuilt with Figma's circle+checkmark+connector style; a new `ConfirmStep` matches Figma's summary/review screen; a new `SiteFooter` (logo + Kontakt/O projekte links) matches Figma's persistent footer, present on every page now
- [x] Kept sharing primitives across screens — same shadcn components via props/variants, no copy-pasted variants
- [x] Visually diffed every screen against `get_screenshot` and the running app (Chrome), iterating until they matched — see deviations below

**Second pass — corrections after review.** A first pass got the tokens/assets right but kept several structures Figma doesn't have. Re-checked against the frames and fixed:
- **Site header removed entirely.** Figma has no header on any frame — navigation lives only in the footer. `site-header.tsx` was deleted and the `LanguageSwitcher` moved into `SiteFooter` (it's a bonus feature Figma never shows, and the footer is now the only nav surface).
- **Totals widget moved to "O projekte" only.** The "vyzbierané doteraz / darcov" card was on the donation form page, which Figma doesn't show at all. `ResultsSummary` was restyled into Figma's About-page metric pair (two large `#4F46E5` numbers between top/bottom rules) and now renders **only** on `/about`. It stays a client component so the numbers keep polling live rather than being frozen at Figma's mock values (`12 200 €` / `1 028`).
- **Footer scoped to the content column.** Figma nests the footer *inside* the 658px form column, so on the donation page it stops where the side photo begins rather than spanning the viewport. `SiteFooter` was pulled out of the root layout and is now placed per page — inside the form column on `/`, full-width on `/contact` and `/about` (which have no side photo). It also gained the top rule, the real Facebook/Instagram icons from the design, and Figma's 32px link spacing.
- **Action buttons corrected.** Figma's "Späť" is a filled secondary button with a left-arrow icon and "Pokračovať" carries a right-arrow — both 32px/16px padding, 16px label. Added an `xl` size to `buttonVariants` and switched Back from `ghost` to `secondary`. The actions are also pinned to the bottom of the column (`mt-auto`) as in the design.
- **Missing "Späť" back link added to `/contact`.** Both the Contact and O projekte frames open with one; only About had it.

**Deviations knowingly kept (all judgment calls, not oversights):**
- **Multi-donor stays.** Figma only mocks a single donor; the `useFieldArray` multi-donor bonus (Phase 9) was kept since it's genuine extra functionality, not a visual regression — the per-donor consent checkbox that used to live in this step was removed and replaced by Figma's single top-level consent field on the confirmation step (schema: `consent` moved from `contributorSchema` to `donationFormSchema`).
- **Socials shown on every footer.** Figma only draws the Facebook/Instagram icons in Step 1's footer and omits them from Steps 2–3, Contact and About — almost certainly mock inconsistency rather than intent, so they're rendered consistently everywhere. Links point at the bare platform domains since the design specifies no real profile URLs.
- **New `/about` route added.** Figma's "O projekte" frame had no equivalent page in the app before this pass; added `src/app/[locale]/about/page.tsx` with the same copy and the live totals described above.
- **Contact page copy adapted, not copied verbatim.** Figma's Contact frame mixes English placeholder copy with an unrelated `hello@goodrequest.com` email (a leftover from the design tool's own template, not the fictional foundation) — the layout/icons were matched exactly but the copy was localized into `messages/{sk,en}.json` and the email swapped to `info@goodboyfoundation.sk`; the Žilina office address and `+421 911 750 750` phone number from Figma were kept as-is.
- **Forced light theme.** The Figma file only defines a light palette; `ThemeProvider` was switched from `defaultTheme="system"` to `forcedTheme="light"` in `src/app/providers.tsx` so the app doesn't silently break Figma parity for users/browsers with a dark OS preference (which is how the mismatch was first caught during manual QA).

> 📍 **Commit:** `208f236 feat: rebuild donation form and site UI to match Figma design` — committed

**Note:** Figma defines the *look*; business rules (field lengths, required/optional, phone format, consent) still follow `CLAUDE.md`. No conflicts were found — Figma's copy/layout and `CLAUDE.md`'s validation rules line up everywhere they overlap.

---

## Phase 2 — Data layer

Base URL: `https://frontend-assignment-api.goodrequest.dev`, endpoints per [openapi.json](../input/openapi.json).

- [ ] `src/lib/api-client.ts` — **not created as a separate file.** The three `fetch` calls live directly in `src/services/shelters.ts` (`getShelters`, `getSheltersResults`, `postContribute`), each throwing a plain `Error` on a non-`ok` response. There is no shared/typed `ApiError` or a single fetch-wrapper abstraction — acceptable for 3 endpoints, but would need extracting if the API surface grows.
- [x] `src/lib/validations/api.ts` — **done.** `shelterSchema`/`sheltersResponseSchema`/`resultsResponseSchema`/`contributeMessageSchema`/`contributeResponseSchema`, mirroring `docs/input/openapi.json` exactly (`contribution` nullable, message `type` as a 4-value enum). `Shelter`/`SheltersResponse`/`ResultsResponse`/`ContributeMessage`/`ContributeResponse` are now `z.infer`'d from these instead of hand-written, then re-exported from `src/services/shelters.ts` so none of the 9 existing consumer files needed to change their imports. Unit-tested in `src/lib/validations/api.test.ts` (valid shapes, a null `contribution`, a rejected unknown message type, a rejected malformed shelter).
- [x] `src/services/shelters.ts` — `getShelters(search?)`, `getSheltersResults(search?)`, `postContribute(body)`, plus `toContributeBody()` (form → API payload mapping) and `getContributeError()` (extracts the first `ERROR` message from `messages[]`) — **resolved:** each function now parses its JSON body through the matching schema via `safeParse` and throws a descriptive `Error` on a shape mismatch, on top of the existing non-`ok` check. Covered in `src/services/shelters.test.ts` (`response validation` block, mocked `fetch`) — a well-formed response round-trips, a malformed one throws `Invalid <endpoint> response`.
- [x] `src/hooks/use-shelters.ts` — contains **all three** hooks (`useShelters`, `useSheltersResults`, `useContribute`) in one file with a shared `sheltersKeys` query-key factory, rather than the three separate files the plan sketched (`use-shelters.ts` / `use-results.ts` / `use-contribute.ts`). Kept together because they share the same key factory and it's a small surface; split them out if the hooks grow.
- [ ] `src/hooks/use-results.ts` — merged into `use-shelters.ts` (see above)
- [ ] `src/hooks/use-contribute.ts` — merged into `use-shelters.ts` (see above)
- [x] Form data → API payload mapping in one place, as a testable pure function — `toContributeBody()`, unit-tested in `src/services/shelters.test.ts`

**Note:** the optional-first-name-vs-required-`firstName` mismatch (see Open questions) is resolved in `toContributeBody`: `firstName: name ?? ""`.

> 📍 **Commit:** `6328534 feat: validate shelters API responses against Zod schemas` — committed; the dedicated `api-client.ts` extraction is still deliberately deferred, see above

---

## Phase 3 — Form validation schemas (Zod v4)

- [x] `helpType`: enum `GIFT_FOUNDATION` | `GIFT_SHELTER`
- [x] `shelterId`: optional for `GIFT_FOUNDATION`, **required** for `GIFT_SHELTER` — implemented via `.refine()` on the whole object with `path: ["shelterId"]`, not `.superRefine()` (equivalent outcome for a single cross-field condition; `superRefine` would only be needed for multiple related issues at once)
- [x] `amount`: required positive number — kept as `z.number().positive()` (not `z.coerce.number()`, see rationale below) with the number `<input>` registered via RHF's `valueAsNumber: true`; an empty/non-numeric input becomes `NaN`, which fails `.positive()` and surfaces the "Amount must be greater than 0" message rather than a raw type error
- [x] Personal details: `name` optional 2–20 chars (empty string → `undefined` via `.refine()` + `.transform()`, tested explicitly for the `""` edge case), `surname` required 2–30, `email` required and valid (`z.email()`, Zod v4 top-level form)
- [x] `phone`: SK `+421` / CZ `+420` format — **deviation:** implemented as a **single combined schema** (`skCzPhoneSchema`, one regex over the full `"+421 900 000 000"` string) rather than "separate schema + normalization before submit." The `PhoneInput` component itself splits/recombines prefix + national number for display, so the country-flag UI and the single-string schema stay in sync by construction; no separate normalization step was needed.
- [x] `consent`: **deviation:** `z.boolean().refine(v => v === true)` instead of `z.literal(true)`. Reason: `z.literal(true)` makes the *input* type of the field also `true`, which makes it impossible to type a legitimate unchecked (`false`) default value for the checkbox without an unsafe cast. `z.boolean().refine(...)` keeps `false` as a valid default while still failing validation until the box is checked. **Moved in the Phase 1.5 rework:** `consent` now lives on `donationFormSchema` directly rather than on `contributorSchema` — Figma's "Potvrdenie" step shows a single consent checkbox for the whole submission, not one per donor (see Phase 1.5).
- [x] Slovak error messages for all rules — **done via the Phase 9 i18n bonus.** `donation.ts` exports `createDonationFormSchema(messages: ValidationMessages)` / `createContributorSchema` / `createPhoneSchema` factories instead of static schemas; `DonationForm` builds the schema with `useTranslations("validation")` strings memoized via `useMemo`. The plain `donationFormSchema`/`contributorSchema`/`skCzPhoneSchema` exports still exist (built from `defaultValidationMessages`, English) purely so `donation.test.ts` and the `ShelterStep` test harness don't need a translation context to exercise validation logic — they're not used by the running app.

> 📍 **Commit:** not a standalone commit — landed in `76a2847` (base build), with the consent-field move and localization refactor landing in `208f236`/`961837b`

---

## Phase 4 — Form state

- [x] `src/stores/donation-form-store.ts` (Zustand) — holds only `step` + `goToStep`/`goNext`/`goBack`/`reset`; **deviation:** does not also hold "the in-progress data" — form field values live solely in the single `useForm` instance in `DonationForm`, which is fine since the whole multi-step flow is one mounted component (no unmount/remount between steps that would lose RHF state). **Renamed in the Phase 1.5 rework** to match Figma's actual steps: `DONATION_STEPS = ["shelter", "details", "confirm", "success"]` (was `["help-type", "amount", "details", "success"]` — help-type/shelter/amount now live together on one screen, and `confirm` is the new review step).
  - **Superseded, 2026-08-31 (Phase 9 SEO):** this file and `donation-form.tsx` were deleted. Each step is now a real route (see Phase 9's SEO bullet for the full rationale/breakdown), so "which step" is owned by Next.js routing (the URL), not Zustand — `DONATION_STEPS`/`STEP_PATHS`/`stepFromPathname` moved to `src/components/donation-form/constants.ts`, and form state now lives in `DonationWizardProvider` (a persistent layout-level component), shared to each step's `page.tsx` via React Context. Zustand is currently unused in this codebase as a result — see the deviation note at the end of Phase 9.
- [x] A single `useForm` with `zodResolver` across all steps — **deviation:** `mode: "onBlur"` rather than `mode: "onTouched"` (both satisfy "clearly notify the user of errors" without shouting mid-keystroke; `onTouched` would additionally re-show an error while still focused after a blur — a minor UX difference, easy to switch if preferred)
- [x] Per-step validation (`form.trigger([...fieldsForThisStep])`) — implemented via a `STEP_FIELDS` map keyed by step name (`shelter: [helpType, shelterId, amount]`, `details: [contributors]`, `confirm: [consent]`); no advancing without passing validation
- [x] Reset both form and store after a successful submission — **implemented as user-initiated**, not automatic: on success the flow shows a confirmation screen with the API's `messages[]`, and `form.reset()` + store `reset()` only fire when the user clicks "Make another donation." (Kept deliberately so the confirmation screen doesn't blank out immediately.)

> 📍 **Commit:** not a standalone commit — landed in `76a2847` (base build); the step names were renamed in `208f236`

---

## Phase 5 — UI: form steps

**Restructured in Phase 1.5** to match Figma's actual 3-step wizard (`shelter` → `details` → `confirm`) instead of the originally-planned `help-type` → `amount` → `details` split — see Phase 1.5 for why. `help-type-step.tsx` and `amount-step.tsx` no longer exist; their content is merged into `shelter-step.tsx`, and a new `confirm-step.tsx` was added.

- [x] Step indicator (progress) — `StepIndicator` rebuilt to match Figma: circle+checkmark per completed step, connecting "tail" line, current step filled — **verified against Figma** (see Phase 1.5)
- [x] Step 1 (`shelter-step.tsx`, "Výber útulku") — help type as a Figma-style segmented control (`RadioGroup` with `sr-only` inputs styled as pill tabs, not the old bordered radio cards), shelter selection, **and** the amount picker all on one screen, matching Figma exactly
- [x] Shelter selection (`Select`) — 🟡 **deviation:** bound to a **server-fetched** `shelters` prop (fetched once in the `page.tsx` Server Component and passed down), not to the client `useShelters()` hook. That means there's currently **no client-side loading skeleton, no error fallback, and no explicit empty-list state** for the shelter picker — if the server-side fetch fails, Next's error boundary shows a generic error page instead of a graceful in-form fallback. `useShelters()` exists and is ready to use if this needs to become a client-fetched, re-searchable list later. **Stale here:** this used to point at a "Phase 9 shelter-search bonus" that was never actually added to Phase 9's bonus list below (only i18n, SEO, multi-donor and animations were built) — the search-enabled hook is still unused, dangling functionality, not a linked-to feature. **Deviation from Figma's layout:** the shelter field is always rendered (Figma never hides it), but its label switches between "(Nepovinné)" and no suffix, and validation still only requires it for `GIFT_SHELTER`, per `CLAUDE.md`.
- [x] Amount picker — Figma's large underlined numeric input (euro icon, `text-heading-xl`) + 6-preset row, corrected to Figma's actual values **5/10/20/30/50/100 €** (was a 5/10/25/50 placeholder guess — see Open questions, now resolved)

> 📍 **Commit:** not a standalone commit — `shelter-step.tsx` was created in `208f236`

- [x] Step 2 (`personal-details-step.tsx`, "Osobné údaje") — name, surname, email, phone; consent checkbox **removed from this step** (moved to the confirm step, see below)
- [x] Phone with +421/+420 country-code picker and a real flag icon (`PhoneInput`) — SK flag downloaded from Figma, CZ flag hand-authored to match (see Phase 1.5)
- [x] ⭐ (bonus, done ahead of Phase 9) multi-donor support via `useFieldArray` — add/remove donor rows, each with its own name/surname/email/phone (Figma only shows a single donor; kept as a deliberate bonus, see Phase 1.5 deviations). **Enhanced since:** a row now collapses into a read-only summary once it validates (`a48d764`) and "Pridať ďalšieho darcu" is disabled until every open row is valid (`b9bca2e`), so the form can't grow with several half-finished rows at once.

> 📍 **Commit:** not a standalone commit — original step landed in `76a2847`, restructured in `208f236`; the collapse-completed-rows and disable-add-until-valid behavior landed later in `a48d764`/`b9bca2e`

- [x] Step 3 (`confirm-step.tsx`, "Potvrdenie") — **new step, not in the original plan**, added to match Figma: read-only summary of help type / shelter / amount / each donor's name+email+phone, followed by the single consent checkbox for the whole submission and the final submit button
- [x] Field-level error display — `FieldError` under every input, `aria-invalid` set, `data-invalid` on the wrapping `Field` for styling
- [x] Error summary on submit attempt — **removed.** An aggregated `role="alert"` block (`ErrorSummary`/`error-summary.tsx`) was built and verified, but was redundant with the existing per-field `FieldError` (`aria-invalid` + `aria-describedby`) already on every input, so it was deleted along with its supporting helper (`src/lib/form-errors.ts` and its test) and the `errorSummaryTitle` catalog key. Field-level error display remains the only error surface.
- [x] Transitions/animations between steps — **done** (was stale here: this line was checked off with "not done" text left over from before the work happened). Landed later as part of the Phase 9 animation pass (`202bc11`): each step fully unmounts/mounts on `step` change, so `animate-in fade-in-0 slide-in-from-right-2` on `ShelterStep`/`PersonalDetailsStep`/`ConfirmStep` replays on every transition. See Phase 9's last bullet for the full list of micro-interactions.
- [x] Every step compared against its Figma screenshot — **done** (Phase 1.5); the wizard, Contact page and new About page were all visually verified against `get_screenshot` and the running app in Chrome at desktop and mobile widths

> 📍 **Commit:** not a standalone commit — `confirm-step.tsx` was created in `208f236`

---

## Phase 6 — Submission, results, Contact page

- [x] Form submission via `useContribute`, disabled + loading button state (`contribute.isPending` → button disabled, label "Submitting…")
- [x] Success state (confirmation screen listing the API's `messages[]`) + invalidation of the `["shelters","results"]` query on success
- [x] Error state — both a network/thrown-error catch (generic toast) and an explicit `messages[].type === "ERROR"` check (`getContributeError`) that shows the real API error message and does **not** transition to the success step

> 📍 **Commit:** not a standalone commit — landed in `76a2847`; the shelter-during-general-donation and controlled-select edge cases were fixed later in `a1f0fb8`/`373dc20`

- [x] "Total raised + donor count" widget (`ResultsSummary`) bound to `useSheltersResults` (client, `refetchInterval: 30_000`) seeded with a server-fetched `initialData` prop; currency formatted via next-intl's locale-aware `useFormatter()`. **Lives only on `/about`** — Figma shows these totals on the "O projekte" frame and nowhere else (it was wrongly placed on the donation form in the first Figma pass).
- [x] Loading skeleton and error fallback for the widget — no loading skeleton needed (real `initialData` from the server means no loading flash to cover); a visible error fallback was added for a failed client-side refetch — `ResultsSummary` now reads `isError` from `useSheltersResults` and shows a localized inline warning below the metrics while still displaying the last good (or initial) data

> 📍 **Commit:** not a standalone commit — landed in `76a2847`, restyled and moved to `/about` in `208f236`; the error-fallback state landed in `495b784`

- [x] `/contact` page with the organization's contact details (Server Component, static) — rebuilt in Phase 1.5 to match Figma's back link + 3 "featured icon" cards (email/office/phone) + hero photo layout, with the real contact icons downloaded from Figma
- [x] ⭐ `/about` ("O projekte") page added in Phase 1.5 to match a Figma frame that had no route before — mission copy plus the live total-raised/donor-count metric pair (`ResultsSummary`, sourced from `getSheltersResults()`, not hardcoded like Figma's mock numbers)
- [x] Navigation between the form, About and Contact pages — via `SiteFooter` only (logo + socials + Kontakt/O projekte + language switcher). **No site header**, matching Figma; the footer is scoped to each page's content column so it stops at the side photo on the donation form.

> 📍 **Commit:** not a standalone commit — the `/about` route, `SiteFooter` and Contact rebuild all landed in `208f236`

---

## Phase 7 — Accessibility and responsiveness

- [x] Correct `label`/`htmlFor` and `aria-invalid` — **done**; `aria-describedby` pointing at the error message's own id — **done.** Every field that can show a `FieldError` (contributor name/surname/email/phone, `shelterId`, `amount`, `consent`) now sets `aria-describedby="<field>-error"` only while that field is actually invalid, and the matching `FieldError` carries that `id` (it already forwarded arbitrary props, so no change was needed there). `PhoneInput` was extended to accept and forward `aria-describedby` to its inner `Input`. Verified live in Chrome: for a triggered error, `document.activeElement.getAttribute('aria-describedby')` resolves via `getElementById` to the exact `role="alert"` error node with the matching message text.
- [x] Full keyboard operation of the whole flow — **verified manually in Chrome** (keyboard-only, no mouse) end-to-end: segmented help-type control and amount presets behave as a proper roving-tabindex radiogroup (arrow keys move within the group, Tab exits it to the next control); the shelter `Select`, amount input, `PhoneInput`'s country `Select` + national-number input, "Pridať ďalšieho darcu", and the consent `Checkbox` (Space toggles it) are all reachable and operable by keyboard alone; disabled controls (e.g. "Späť" on step 1) are correctly skipped in the tab order. No keyboard traps found.
- [x] Focus management on step change, and focus moved to the first error — **done.** Each step's `<h1>` (and the success screen's) is now `tabIndex={-1}` and receives `.focus()` via a `useEffect` keyed on the store's `step` (skipped on the very first render so initial page load doesn't steal focus from the URL bar) — verified in Chrome that advancing/going back moves focus to the new heading. Separately, a failed `form.trigger()` on "Pokračovať" and a failed `form.handleSubmit` on "Prispieť" both now call `focusFirstInvalidField()`, which queries the current step's container for the first `[aria-invalid="true"]` element (generic across plain inputs, `Select` triggers, and the `Checkbox`, since all of them already set `aria-invalid`) and focuses it — verified in Chrome for the amount field, the email field, and the consent checkbox.
- [x] Contrast and a visible focus ring per WCAG — **checked.** Every interactive primitive (`Input`, `Button`, `Select`, `Checkbox`, `RadioGroup`, `Toggle(Group)`) already carries a `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` treatment; `--ring` (`#4f46e5`) against the white background measures ~6.3:1, well past the 3:1 non-text/UI-component threshold. Hand-computed WCAG contrast ratios (relative luminance formula) for every `--*-foreground`-on-background token pair found one real failure: `--muted-foreground` was Figma's literal `#9ca3af` (Tailwind gray-400), used as real body/hint text (`FieldDescription`, the "(Nepovinné)" hint) — only ~2.5:1 on white, failing AA's 4.5:1. Fixed by darkening it one Tailwind step to gray-500 (`#6b7280`, ~4.8:1) in `globals.css`; every other pair checked (`--foreground`/`--secondary-foreground` on their backgrounds, `--primary-foreground` on `--primary`, `--destructive` text, which is exactly Tailwind red-600 at ~4.8:1) already passes AA. This is a deliberate, minimal deviation from Figma's literal hex value, kept in the same gray family — see the comment left in `globals.css` at the token.
- [x] Mobile-first Tailwind classes per the `mobile-first-design` skill — base (unprefixed) classes are mobile, `sm:`/breakpoint variants layer on top throughout (e.g. `grid gap-4 sm:grid-cols-2`, `hidden ... sm:inline`)
- [x] Verify layout at mobile (390px) and desktop (1440px) against Figma — **done in Phase 1.5** via the Chrome browser tool. 768px (tablet) wasn't separately checked; Figma only supplies desktop (1440px) frames, so the mobile layout is this app's own responsive interpretation, not a 1:1 frame match — below `lg` the side photo is hidden and the form/footer take the full width.

> 📍 **Commit:** `4051f18 feat: add focus management, aria-describedby and contrast fixes` — committed

---

## Phase 8 — Tests

- [x] Unit tests for the Zod schemas — `src/lib/validations/donation.test.ts`: phone (+421/+420 accepted, +48 and no-code rejected), name (empty passes, 1/21 chars fail), surname boundaries, invalid email, consent `false` rejected, amount zero/negative/positive, both branches of the `shelterId` refine
- [x] Unit test for the form → API payload mapping — `src/services/shelters.test.ts`: `GIFT_FOUNDATION`→`shelterID: null`, `GIFT_SHELTER`→chosen id, absent name → `firstName: ""`, plus `getContributeError` (no `ERROR` → `undefined`; `ERROR` present despite HTTP 200 → returned)
- [x] Component tests for the steps (RTL): error rendering, blocked navigation to the next step — **done.** `src/components/donation-form/shelter-step.test.tsx` (replaces the old `help-type-step.test.tsx`, which was deleted along with `help-type-step.tsx`/`amount-step.tsx` in the Phase 1.5 rework) covers the optional/required shelter label toggling and that clicking a preset amount updates the numeric input. `personal-details-step.test.tsx` (harness now runs in `mode: "onBlur"`, matching the real `DonationForm`) and the new `confirm-step.test.tsx` assert an inline `role="alert"` error actually renders — invalid e-mail/phone/surname on blur, missing consent on submit attempt — and clears once the field is fixed. The new `donation-form.test.tsx` mounts the whole wizard and asserts an invalid amount blocks `goNext()` (stays on the shelter step, shows the error) while a valid one advances to the details step. (Needed a `scrollIntoView` polyfill added to `vitest.setup.ts` — jsdom doesn't implement it, and `DonationForm`'s step-change focus effect calls it on every real step transition.)
- [x] Component test for the results widget with a mocked fetch (MSW or a mocked service) — **done.** `src/components/results/results-summary.test.tsx` mocks `getSheltersResults` directly (`vi.mock`, matching the existing `shelters.test.ts` convention, since MSW isn't installed in this project) and covers the initial-data → refetched-data swap, the `isError` fallback/refresh-error message with the last-known data staying on screen, and the 30s `refetchInterval` poll actually firing again.

> 📍 **Commit:** not a standalone commit — the initial suite landed in `76a2847`/`208f236`; `34401d7 test: add component tests for error rendering and blocked navigation` added the rest. **51 tests** now pass (`npm run test`, re-verified 2026-08-31), up from the 28 this doc last counted.

- [x] E2E happy path (Playwright) — `e2e/donation-flow.spec.ts`: general donation → preset amount → fill details → confirm & consent → submit → confirmation screen, with only `POST /contribute` stubbed (the two `GET`s hit the real, read-only API). Updated in Phase 1.5 for the new 3-step flow and field-label copy; both specs still pass.
- [x] E2E validation scenario: empty required fields → errors, cannot advance — **done.** `e2e/donation-flow.spec.ts`: a third spec walks all three steps with required fields left empty (amount, then surname/e-mail/phone, then consent), asserting the matching inline `FieldError` is shown by id and the step's heading stays put (navigation blocked) at each attempt, then fixes each step and confirms the next heading appears; the final assertion confirms the API is never called when consent is missing.

> 📍 **Commit:** not a standalone commit — the initial specs landed in `76a2847`/`208f236`; `d5f6b9f test: add e2e scenario for blocked navigation on empty fields` added the validation scenario. **4 tests** now pass (`npm run test:e2e`, re-verified 2026-08-31): the two above, plus `smoke.spec.ts` ("homepage loads") and a third `donation-flow.spec.ts` case ("submission surfaces an ERROR message from the API instead of succeeding") that this doc hadn't counted yet.

---

## Phase 9 — Bonuses ⭐

> Bonuses are independent of each other — implement any subset, in any order. 📍 Commit each one separately right after it's done, so the base submission stays clean even if a bonus is dropped later.

- [x] ⭐ String localization (i18next / next-intl) — **done with `next-intl`**, Slovak default + English secondary locale via a `[locale]` App Router segment:
  - `src/i18n/routing.ts` (`locales: ["sk", "en"]`, `defaultLocale: "sk"`, `localeDetection: false` — always defaults to Slovak instead of negotiating the browser's `Accept-Language`, since the target audience is Slovak/Czech; language only changes via the in-app switcher), `src/i18n/navigation.ts` (localized `Link`/`usePathname`/`useRouter`), `src/i18n/request.ts` (loads `messages/{locale}.json`)
  - `src/proxy.ts` — locale-routing proxy (Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`; see the [proxy file convention docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy))
  - `src/app/[locale]/{layout,page,contact/page}.tsx` — moved under the locale segment; `generateStaticParams`/`generateMetadata`/`setRequestLocale` wired per next-intl's App Router guide
  - `messages/sk.json` + `messages/en.json` — every UI string (nav, form steps, field labels, aria-labels, toasts, success screen, results widget, contact page, metadata)
  - `src/components/layout/language-switcher.tsx` — a `Select`-based switcher that swaps locale while preserving the current path and in-progress form step. **Stale here since Phase 1.5:** originally lived in `SiteHeader`; that component was deleted (see Phase 1.5's "site header removed entirely") and the switcher now renders inside `SiteFooter` instead.
  - `src/lib/validations/donation.ts` — refactored from static schemas to `createDonationFormSchema(messages)`/`createContributorSchema`/`createPhoneSchema` factories so Zod error messages are localized too; `DonationForm` builds the schema via `useTranslations("validation")` + `useMemo`
  - `src/components/results/results-summary.tsx` — currency formatting now uses next-intl's `useFormatter()` (locale-aware) instead of a hardcoded `sk-SK` `Intl.NumberFormat`
  - Updated `e2e/donation-flow.spec.ts` (Slovak copy, since `/` now defaults to `sk`) and `help-type-step.test.tsx` (wrapped in `NextIntlClientProvider` with the English catalog) accordingly. **Stale here since Phase 1.5:** `help-type-step.test.tsx` was deleted along with `help-type-step.tsx`; the equivalent coverage now lives in `shelter-step.test.tsx` (see Phase 8).
  - 📍 `961837b feat: add next-intl i18n (sk default, en)` — committed
- [x] ⭐ SEO — **done**, including real per-step metadata (was 🟡 partial as of 2026-08-31; the assignment names this explicitly — "implement og:image and various titles and descriptions on different form steps" — so the client-side-only mitigation below wasn't treated as good enough):
  - `generateMetadata`/`export const metadata` for `/`, `/about`, `/contact` via Next's Metadata API, localized per `messages/{sk,en}.json`'s `metadata` namespace
  - `src/app/[locale]/opengraph-image.tsx` — code-generated `og:image` (`next/og`'s `ImageResponse`), localized per `params.locale`, prerendered per locale via `generateStaticParams`
  - `src/app/[locale]/opengraph-assets/inter-{bold,medium}.woff` — Inter subsetted to Latin + SK/CZ diacritics, checked in locally so the prerender has no runtime network dependency
  - `src/app/[locale]/layout.tsx` — `metadataBase` (`NEXT_PUBLIC_SITE_URL`, falls back to `http://localhost:3000`) — **must be set to the real deploy domain before shipping**
  - **Per-step metadata — resolved for real, 2026-08-31, by giving each wizard step its own route.** The wizard was restructured from one route with a Zustand-tracked `step` field into 4 real routes under a `(donation)` route group: `/` (shelter, unchanged URL), `/donate/details`, `/donate/confirm`, `/donate/success`. Each has its own `generateMetadata` pulling the (already-existing) `metadata.donationSteps.{step}.{title,description}` keys — confirmed via `curl` against the production build that the raw SSR HTML for all 4 routes now carries genuinely distinct `<title>`/`<meta name="description">`, not just a client-side `document.title` swap a crawler would never see. This directly satisfies the assignment's wording, and replaces the earlier client-only mitigation (`c21485f`), which is now redundant — Next's App Router already updates `document.title` itself on client-side navigation between real routes.
  - **What changed structurally** (see Phase 4/5 notes for the full breakdown): `donation-form.tsx` (the single mounted component switching on Zustand `step`) and `src/stores/donation-form-store.ts` (which only ever held `step`) were deleted. In their place: `src/app/[locale]/(donation)/layout.tsx` (Server Component, fetches shelters once, persists across step navigation) wraps `DonationWizardProvider` (Client Component, owns the single `useForm()` instance, the step shell — indicator/heading/nav buttons — and the outer hero-photo grid), which shares `form`/`shelters`/`successMessages` down to whichever step's `page.tsx` is currently active via a small React Context (`donation-wizard-context.tsx`) — necessary because the actual step content now lives in separate `page.tsx` files (one per route) that can't call `useForm()` themselves without losing state on navigation. "Continue"/"Back"/submit-success now call `router.push`/`router.replace` (next-intl's `useRouter`) instead of a Zustand `goNext`/`goBack`.
  - **New:** a lightweight guard (`useEffect` in `DonationWizardProvider`) redirects `/donate/details`/`/donate/confirm`/`/donate/success` back to an earlier step if landed on directly (stale bookmark, manual URL, hard reload) without having completed the steps before it in this session — verified live in Chrome (`/sk/donate/confirm` → redirects to `/sk`). This didn't exist before since there was only ever one URL to land on.
  - **Bug found and fixed during this work:** the shared Context's `value` was originally memoized on `[form, shelters, successMessages]`; since `form`'s object reference from `useForm()` never changes even when `form.formState.errors` mutates internally (react-hook-form tracks that via its own Proxy-based subscription, not by changing `form`'s identity), the memoized context value never changed identity either — so a validation error on the shelter step stopped reaching the now-separately-routed step content at all. Fixed by not memoizing the context value (it's cheap to recompute; only real change is that consumers may re-render slightly more than a hand-tuned memo would allow).
  - **Also fixed en route:** `eslint.config.mjs` was missing `playwright-report/**`/`test-results/**`/`coverage/**` in its ignore list, so `npm run lint` was scanning Playwright's bundled/minified HTML-report JS as if it were project source once that directory existed from a prior `test:e2e` run — added them.
  - Test coverage: `donation-form.test.tsx` was replaced by `donation-wizard-provider.test.tsx` (mocks `@/i18n/navigation`'s `useRouter`/`usePathname` rather than a Zustand store, asserts `router.push` is/isn't called instead of asserting DOM content swap in place); all other component tests (`shelter-step.test.tsx` etc.) were untouched and still pass, since they construct their own `useForm()` harness directly and don't touch routing. E2E specs needed one fix, not a rewrite: `getByText("Ďakujeme za váš príspevok!")` became ambiguous (Next's own route-announcer `aria-live` region now duplicates the heading text on client-side navigation — a genuine a11y positive from real routing) — swapped to `getByRole("heading", { name: ... })` everywhere it appeared.
  - Re-verified after the change: `npm run lint`/`tsc --noEmit`/`npm run test` (51 tests)/`npm run build` (all 4 step routes prerender per locale, confirmed in build output: `● /sk/donate/details`, `● /sk/donate/confirm`, `● /sk/donate/success`, etc.)/`npm run test:e2e` (9 tests, including the mobile project) all green; manually clicked through the live flow in Chrome and confirmed the address bar genuinely updates per step.
  - **Deviation this doesn't fix:** `Phase 4`'s Zustand mandate (`CLAUDE.md`: "Shared UI/Multi-step state: Zustand v5") no longer has anything to manage in the donation flow — real routing is the more correct mechanism for step state, and `successMessages` fits naturally as local state in the persistent `DonationWizardProvider`. Zustand remains an installed dependency but is currently unused; flagging this explicitly rather than silently dropping it, since it's a deliberate deviation from the stated architecture, not an oversight.
  - 📍 `cc56e64 feat: add SEO og:image and metadataBase` — committed; the per-step routing work above landed in `d2cbf2a feat: route each donation form step for real per-step SEO metadata` — committed (see Phase 10)
- [x] ⭐ Multiple donors (`contributors[]`) via `useFieldArray` — **done**, add/remove donor rows in `PersonalDetailsStep` (see the collapse/disable-until-valid enhancements noted in Phase 5) — 📍 landed in `76a2847`/`208f236`, enhanced in `a48d764`/`b9bca2e` — all committed
- [x] ⭐ Subtle animations and micro-interactions across the UI — step-content entrance transition on every wizard step change (each step already fully unmounts/mounts on `step` change, so `animate-in fade-in-0 slide-in-from-right-2` on `ShelterStep`/`PersonalDetailsStep`/`ConfirmStep` replays for free); `StepIndicator` circles/labels/connector now `transition-colors`, with the connector filling `bg-primary` once a step is complete and its checkmark popping in (`animate-in zoom-in-50`); field-level errors (`FieldError` in `field.tsx`) fade+slide in on mount instead of appearing instantly; `Checkbox`'s check mark pops in (`zoom-in-50`); the personal-details donor row fades in on both collapse-to-summary and expand-to-form; the confirm-step submit button gets a spinning `Loader2` next to "Submitting…"; `ResultsSummary`'s two metrics fade in whenever a background poll changes the formatted value; `Toggle`/`ToggleGroupItem` (the amount presets) get `active:scale-95` press feedback; `SiteFooter` nav links and social icons get a hover color/opacity transition. Also added a global `prefers-reduced-motion: reduce` override in `globals.css` (zeroes animation/transition durations for everything except `.animate-spin`, so the submit spinner keeps indicating real async work) — ties into the Phase 7 accessibility work rather than only being visual polish. Verified via `lint`/`build`/`test`/`test:e2e` (all green) and a manual click-through of the full flow in Chrome. — 📍 `202bc11 feat: add subtle animations and micro-interactions across the UI` — committed

---

## Phase 10 — Final check and handover

- [x] `npm run lint` — clean (re-verified 2026-08-31, after the routing refactor + the `eslint.config.mjs` report-artifact ignore fix — see Phase 9)
- [x] `npm run build` — passes, no TS errors; no `any` used anywhere in the new code (re-verified 2026-08-31; all 4 wizard step routes now prerender per locale, see Phase 9)
- [x] `npm run test` and `npm run test:e2e` — green, **51 unit/component tests, 9 e2e tests** (re-verified 2026-08-31, after the routing refactor — e2e grew from 4 to 9 with the shelter-specific/custom-amount/name-length/mobile-viewport specs; one e2e selector had to be tightened, see Phase 9)
- [x] README: project description, how to run it, decisions and deviations from the assignment — **done and committed** (`09add6a doc: created readme.md file`)
- [x] Manual walkthrough of the whole flow in the browser (mobile + desktop) — **done in Phase 1.5**, at both desktop (1440px) and mobile (390px) widths via the Chrome browser tool. Full flow (shelter step → personal details → confirm & consent) was walked through with the confirm-step summary verified against the entered data; the actual final submission was deliberately **not** clicked for real (it would POST a real donation into the assignment's shared live database) — that path is instead covered by unit tests + the stubbed e2e tests. **Re-walked 2026-08-31** after the per-step routing refactor: confirmed the address bar genuinely updates per step (`/sk` → `/sk/donate/details`), and that landing directly on `/sk/donate/confirm` without prior progress redirects back to `/sk` as intended.
- [x] Final visual side-by-side comparison of every screen against Figma, assets included — **done** as part of Phase 1.5

**Not in the original plan, added since:** a Docker build setup (`docker/Dockerfile`, `docker/docker-compose.yml`, `.dockerignore`, plus `output: "standalone"` in `next.config.ts`) — `5ea398c chore: add Docker build setup with compose`, committed. `docker compose -f docker/docker-compose.yml up --build` builds and serves the app on `:3000`; documented in the README. Also `next.config.ts`'s `agentRules: false` (`7d457cd chore: disable Next.js agentRules auto-rewrite of CLAUDE.md`, committed) — Next 16's `next dev`/`next start` auto-detect AI coding agents and rewrite `CLAUDE.md` with a managed docs-pointer block on every run; this opts out since the repo has its own `CLAUDE.md`.

**Re-audit, 2026-08-31 (later same day):** the per-step routing refactor described in Phase 9's SEO bullet (new `(donation)` route group/layout/provider/context, deleted `donation-form.tsx`/`donation-form-store.ts`, the `eslint.config.mjs` ignore fix, and the e2e selector fix) is now committed as `d2cbf2a feat: route each donation form step for real per-step SEO metadata`, followed by `97f3da7 docs: update implementation plan for per-step routing and SEO status` (this doc), then two more mobile-focused fixes: `27d1479 fix: remove leftover vertical scroll inside confirm step` and `4babbaf fix: reclaim clipped focus ring on wizard step content on mobile`. `git status` is clean — nothing outstanding. Full re-verification (`lint`, `test` — 51 passing, `build`, `test:e2e` — 9 passing) all green.

---

## Open questions / decisions

- [x] How to map the optional first name onto the required `firstName` in the API payload — **resolved:** `firstName: name ?? ""` in `toContributeBody` (`src/services/shelters.ts`)
- [x] Exact preset amount values and copy — **resolved in Phase 1.5.** Figma specifies `5 / 10 / 20 / 30 / 50 / 100 €`; the app now uses those instead of the earlier 5/10/25/50 placeholder guess.
- [x] Phone format sent to the API (`+421 900 000 000` vs. the `0900 000 000` example in the spec) — **resolved:** the app sends the full international format with country code, e.g. `"+421 900 123 456"` (matches the `skCzPhoneSchema` regex the form validates against), not the local `0900 000 000` style from the OpenAPI example.
- [x] Should the app's language be Slovak or English? — **resolved:** neither exclusively — the app is now localized with `next-intl` (Slovak default, English switchable), which resolves Phase 3's "Slovak error messages" item and doubles as the Phase 9 i18n bonus. See Phase 9 for the full implementation.
- [x] Should API responses be runtime-validated with Zod (`safeParse`), as both this plan and the `api-integration`/`zod-validation` skills recommend, or is compile-time typing considered sufficient for these 3 read/write endpoints? — **resolved:** validate. `src/lib/validations/api.ts` now covers all 3 responses (Phase 2).
