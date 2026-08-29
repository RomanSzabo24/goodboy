---
name: project-structure
description: Decide where a new file, folder, route, component, hook, or test belongs in this Next.js App Router project, and scaffold new features consistently with the layout mandated by CLAUDE.md. Use whenever creating a new route/page, adding a component/hook/store/service, setting up shadcn, or when unsure where something should live.
---

# Project structure — GoodBoy Foundation donation form

The repo is a fresh Next.js 16 App Router scaffold (`src/app/layout.tsx`, `src/app/page.tsx` only exist so far) — there is no legacy layout to match, so lay out new code according to this target structure rather than copying ad-hoc patterns from what's already there.

Path alias: `@/*` → `./src/*` (see `tsconfig.json`). Always import via `@/...`, never relative paths that climb more than one level.

## Target layout

```
src/
  app/                          # App Router routes only — no business logic here
    layout.tsx                  # root layout (fonts, providers: QueryClientProvider, etc.)
    page.tsx                    # landing / donation form entry
    globals.css                 # Tailwind v4 + @theme tokens
    contact/
      page.tsx                  # Contact page (Server Component, static org details)
    ...                         # add route segments only for actual distinct URLs;
                                 # the multi-step donation flow is ONE route with
                                 # Zustand-driven step state, not one segment per step
                                 # (see [[figma-design]])

  components/
    ui/                         # shadcn-generated primitives ONLY — installed via
                                 # `npx shadcn@latest add <name>`, never hand-written
                                 # or hand-edited beyond intended shadcn customization
    donation-form/               # feature components for the donation flow
      help-type-step.tsx
      shelter-picker.tsx
      amount-step.tsx
      personal-details-step.tsx
    results/
      results-summary.tsx       # total raised / donor count widget
    layout/                      # header/footer/nav shared across routes, if any

  services/                      # plain fetch wrappers, no React/Query imports
    shelters.ts                  # see [[api-integration]]

  lib/
    validations/                 # Zod schemas
      donation.ts                # see [[api-integration]]
    utils.ts                     # shadcn's cn() helper, generic utilities only

  hooks/                         # TanStack Query hooks wrapping services/
    use-shelters.ts

  stores/                        # Zustand stores for multi-step/shared UI state
    donation-form-store.ts

  types/                         # only for types not naturally colocated with a
                                 # schema/service (most types should come from
                                 # z.infer<> or service return types instead)

components.json                  # shadcn CLI config (generated, don't hand-edit)
```

## Rules

- **`src/app/` is routing only.** A `page.tsx`/`layout.tsx` composes components from `src/components/`; it should not contain form logic, fetch calls, or validation schemas inline.
- **One route per real URL**, per `CLAUDE.md`/assignment.md: the donation form (with its internal steps), and `/contact`. Don't invent extra route segments (e.g. `/donate/step-1`) unless the Figma design explicitly shows step-specific URLs — default to client-side step state via a Zustand store.
- **`src/components/ui/`** is shadcn territory exclusively. Feature-specific components go in a feature subfolder (`donation-form/`, `results/`), never directly under `components/`.
- **No business/API logic in components.** Data fetching goes through a `hooks/use-*.ts` TanStack Query hook, which wraps a `services/*.ts` fetch function. Components call hooks, not `fetch`/`services/*` directly.
- **Validation lives in `lib/validations/`** as Zod schemas; derive TypeScript types with `z.infer`, don't hand-write parallel interfaces.
- **Server Components by default** (per `CLAUDE.md`) — only files that need hooks/state/interactivity get `'use client'` at the top. This affects placement too: a component that's purely presentational (e.g. static Contact page content) doesn't need to live next to client-only step components.
- **Naming**: kebab-case filenames (`shelter-picker.tsx`), PascalCase component exports, camelCase for hooks/functions/variables (`useShelters`, `getShelters`).
- **Tests**: colocate unit/component tests as `*.test.tsx` / `*.test.ts` next to the file they test (Vitest + RTL per `CLAUDE.md`). Playwright e2e specs go in a top-level `e2e/` directory, not under `src/`.
- **No `pages/` router, ever** — App Router only, per `CLAUDE.md`.

## When scaffolding something new

1. Is it a real distinct URL? → `src/app/<segment>/page.tsx`, composing components — don't put logic there.
2. Is it a UI primitive shadcn already has? → `npx shadcn@latest add <component>`, lands in `src/components/ui/`. Don't hand-roll it.
3. Is it feature UI specific to the donation flow or results widget? → `src/components/<feature>/`.
4. Does it talk to the API? → a fetch wrapper in `src/services/`, wrapped by a `src/hooks/use-*.ts` TanStack Query hook (see [[api-integration]]).
5. Is it validation? → `src/lib/validations/`.
6. Is it shared state across steps/components (not server state)? → `src/stores/` (Zustand).
7. Implementing a Figma frame? → check [[figma-design]] for the screen→route/component mapping before creating files.
