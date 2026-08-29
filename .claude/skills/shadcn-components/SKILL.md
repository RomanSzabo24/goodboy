---
name: shadcn-components
description: Add or update a shadcn/ui component in this project, or decide whether a UI primitive already exists here vs. genuinely needs hand-rolling. Ensures components are generated on the Radix primitives backend (not shadcn's newer Base UI default) and via the correct CLI invocation. Use whenever a design calls for a button, input, select, dialog, checkbox, form field, toast, etc.
---

# shadcn/ui components — GoodBoy Foundation

`CLAUDE.md` mandates: **shadcn/ui (Radix primitives + Tailwind CSS v4)**, installed via the `shadcn` CLI — *"do not hand-roll components that already exist in shadcn/ui."*

Current state: shadcn is **not yet initialized** — there is no `components.json` and no `src/components/`. The first component you add must be preceded by `init`.

## Decision: does it already exist?

Before writing any UI component by hand, check the shadcn registry. Components this project will almost certainly need, and which shadcn already provides — do **not** hand-roll these:

| Need in the donation flow | shadcn component |
|---|---|
| Help-type choice (foundation vs shelter) | `radio-group` (or `toggle-group` if the design shows segmented buttons) |
| Shelter picker | `select`, or `command` + `popover` for a searchable combobox |
| Preset amount buttons | `button` / `toggle-group` |
| Custom amount + text fields | `input`, `label` |
| Consent checkbox | `checkbox` |
| react-hook-form wiring | `form` (brings `FormField`/`FormLabel`/`FormMessage`, RHF + resolver integration) |
| Submission feedback from `messages[]` | `sonner` (toast) |
| Modal/confirmation | `dialog` |
| Loading placeholders | `skeleton` |
| Contact page / section cards | `card`, `separator` |

Only hand-roll when there is genuinely no registry equivalent (e.g. the multi-step stepper indicator, the phone-input country-flag prefix) — and even then, compose it out of shadcn primitives (`input`, `select`, `button`) rather than starting from raw markup.

Check the registry before concluding something doesn't exist: browse https://ui.shadcn.com/docs/components, or run `npx shadcn@latest add` with no arguments to list what the configured registry offers.

Generated files land in `src/components/ui/` (per `CLAUDE.md` and [[project-structure]]). Never create files there by hand and never copy component source out of the docs — always go through the CLI so `components.json`, dependencies, and `lib/utils.ts` stay in sync.

## Radix backend — verify, don't assume

Recent shadcn CLI versions can generate components against **Base UI** instead of Radix. This project requires **Radix**. The CLI's prompts and flags change between versions, so do not rely on a remembered flag name — verify from the output instead:

1. During `init`, if the CLI asks which primitives/base library to use, choose **Radix**.
2. After the first `add`, **check the generated file's imports**:
   - ✅ correct → `import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"`
   - ❌ wrong → any import from `@base-ui-components/react` / `@base-ui/*`
3. Cross-check `package.json`: new deps should be `@radix-ui/react-*`. If Base UI packages appeared instead, the backend is wrong.

If you got Base UI: delete the generated component file(s) and the Base UI deps, then re-run against the Radix registry — check `npx shadcn@latest add --help` and the current docs for the correct selector in the installed CLI version (registry namespace, `init` prompt answer, or pinning an older CLI major that was Radix-only). Do not paste Radix component code by hand as a workaround, and do not leave a mixed Radix/Base UI `src/components/ui/` — flag it to the user if you can't resolve the invocation.

Record the resolved backend choice in this skill (edit the section above) once confirmed, so the next session doesn't have to re-derive it.

## After adding

- **Tailwind v4**: shadcn writes CSS variables into `src/app/globals.css`. Design tokens from Figma go into the `@theme` block there — see [[figma-design]] — not inlined as raw hex/px in components.
- **Don't hand-edit `components.json`**; change config through the CLI where possible.
- **Customizing a generated primitive is allowed** (that's the point of shadcn) — but keep the file recognizably the shadcn component; feature-specific composition belongs in `src/components/<feature>/`, not stuffed into `src/components/ui/`.
- **Accessibility comes from Radix** — don't strip `aria-*`, `id`/`htmlFor` wiring, or focus management the primitive provides. Form controls must stay label-associated (`CLAUDE.md` §Code Guidelines).
- Verify with `npm run build` and `npm run lint` after adding components.
