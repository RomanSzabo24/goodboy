---
name: figma-design
description: Implement or update UI screens for the GoodBoy Foundation donation form from the project's Figma design. Use whenever building/editing anything under src/app or src/components that has a corresponding Figma frame (donation form steps, Contact page, results/totals widget) or when the user references Figma, a screen, or a mockup for this project.
---

# Figma design → GoodBoy Foundation UI

Canonical Figma file for this project: **`My team Frontend-Assigment-2.0`**, file key **`71F9aOieGNZNowSETLum7t`** (https://www.figma.com/design/71F9aOieGNZNowSETLum7t/My-team-Frontend-Assigment-2.0). This is the file linked from the root `CLAUDE.md` — use it, not the older link in [docs/input/assignment.md](../../../docs/input/assignment.md) (`fOYdJW8UqfZjT8o2WYigty`), which points to the original brief's generic template file.

Business/validation source of truth: root `CLAUDE.md` and [docs/input/assignment.md](../../../docs/input/assignment.md). API shapes: [docs/input/openapi.json](../../../docs/input/openapi.json) — see the [[api-integration]] skill for the data layer.

## Mandatory prerequisites

- Before any `get_design_context` / `get_screenshot` / `get_metadata` call on this file → load `figma-design-to-code` first.
- Before any `use_figma` write (e.g. pushing Code Connect mappings, adjusting the file) → load `figma-use` first.
- Never call those MCP tools directly without the matching skill loaded — it is not optional.

## Screen → route/component map

Confirm exact frame names against the file (they may not match 1:1), but expect this shape:

| Figma frame (approx.) | App route | Key components |
|---|---|---|
| Donation form — help type step | `/` or `/donate` (step 1) | help-type toggle (`GIFT_FOUNDATION` / `GIFT_SHELTER`) |
| Donation form — shelter picker | same flow, conditional step | shelter combobox/list, only mandatory when `GIFT_SHELTER` |
| Donation form — amount step | same flow | preset amount buttons + custom value input |
| Donation form — personal details | same flow, final step | name/surname/email/phone/consent fields |
| Success / confirmation state | same flow | reads `contribute` response `messages[]` |
| Results / totals widget | shown on landing/donation page | total raised + donor count, polled via TanStack Query |
| Contact page | `/contact` | static org contact details (server component, no interactivity expected) |

If the multi-step form spans several Figma frames, treat it as one Zustand-backed multi-step flow per `CLAUDE.md` ("Shared UI/Multi-step state: Zustand v5") rather than separate routes per step, unless the design explicitly shows step-specific URLs.

## Workflow

1. **Read the design**: `get_design_context` (after loading `figma-design-to-code`) on the specific frame/node you're implementing — don't pull the whole file at once. Use `get_screenshot` for a visual sanity check and `get_variable_defs` for design tokens (spacing, color, typography) before hardcoding any values.
2. **Map to shadcn/ui first**: per `CLAUDE.md`, never hand-roll a component that shadcn already provides. Before writing a custom component, check whether the design maps to an existing shadcn primitive (`button`, `input`, `radio-group`, `combobox`/`command`, `checkbox`, `form`, `toast`/`sonner`, `stepper`-like patterns via custom composition). Install missing ones via `npx shadcn@latest add <component>` — do not copy component code by hand.
3. **Tokens over hardcoded values**: translate Figma variables/styles (colors, spacing, radii, font sizes) into Tailwind v4 theme tokens (`@theme` in globals.css or `tailwind.config`) rather than inlining raw hex/px values in components.
4. **Respect the RSC boundary**: layout/static sections (e.g. Contact page, the results totals *display* if not interactive) are Server Components by default. Add `'use client'` only for the pieces that actually need it — form steps, the shelter picker, the live results counter (`useSheltersResults` from the [[api-integration]] skill's TanStack Query hooks).
5. **Wire validation from `CLAUDE.md`**, not assumptions from the mockup — the Figma file shows *layout*, the business rules (field lengths, mandatory/optional, SK/CZ phone format, consent) come from `CLAUDE.md` §Business & Form Validation Logic and the Zod schemas in [[api-integration]].
6. **Accessibility**: every form control needs a real `<label htmlFor>` (or shadcn `FormLabel` wired via `FormField`), visible focus states, and keyboard-operable custom controls (combobox, stepper nav) — don't rely on the design alone to convey this.
7. **Place files per `CLAUDE.md` layout**: feature components under `src/components/` (shadcn primitives stay generated under `src/components/ui/`, don't hand-edit their structure beyond intended customization), API logic in `src/services/`, Zod schemas in `src/lib/validations/`.
8. **Verify visually**: after implementing a screen, compare against `get_screenshot` output and, once the dev server can run, check the real page in-browser (see the `run` / `claude-in-chrome` skills) — type-checking and tests confirm correctness, not visual fidelity to the design.

## Gotchas

- Two different Figma links exist in this repo's docs (see above) — always confirm you're looking at `71F9aOieGNZNowSETLum7t` for actual screen layouts, since the assignment.md one is a generic/legacy template and may not match current business rules.
- `get_design_context` node IDs are file-specific — don't reuse a node ID copied from a different file/frame.
- If a frame shows fields or copy that conflict with `CLAUDE.md` (e.g. different min/max lengths), `CLAUDE.md`'s stated validation rules win — flag the discrepancy to the user rather than silently picking one.
