---
name: mobile-first-design
description: Write or review Tailwind classes and layout for any page or wizard step in this project — deciding breakpoint order, checking a component is genuinely mobile-first, or verifying a layout against Figma's mobile vs. desktop frames. Covers the assignment's responsive-design stretch goal. Use whenever adding/editing className layout, grid/flex structure, or responsive variants.
---

# Mobile-first design — GoodBoy Foundation

Responsive design is an explicit stretch goal in [docs/input/assignment.md](../../../docs/input/assignment.md) ("If you have some spare time"), and *"the visual quality of the application and styling is also part of the evaluation."* So responsiveness here is scored work, not an afterthought — every screen must be usable at 320px.

Tailwind CSS v4 (see `src/app/globals.css`, `@import "tailwindcss"`). Tailwind is mobile-first **by design**: an unprefixed utility applies at every width; `sm:`/`md:`/`lg:` are `min-width` overrides that kick in *upward*.

## The one rule

**Unprefixed = mobile. Prefixed = progressive enhancement.**

```tsx
// ✅ mobile-first: stacked by default, side-by-side from md up
<div className="flex flex-col gap-4 md:flex-row md:gap-8">

// ❌ desktop-first thinking — this is the anti-pattern
<div className="flex flex-row gap-8 sm:flex-col">
```

If you catch yourself writing a `max-*:` variant, or an `sm:`/`md:` utility that *undoes* a bigger unprefixed value back down to something smaller, the base styles were written for desktop. Rewrite the base for mobile instead.

Default breakpoints: `sm` 40rem/640px · `md` 48rem/768px · `lg` 64rem/1024px · `xl` 80rem/1280px. Don't add custom breakpoints unless the Figma frames genuinely demand one — and if you do, define it in the `@theme` block in `globals.css`, not inline.

## Reviewing a component — checklist

1. **Does it read mobile → up?** Base classes describe the narrowest layout; every prefixed variant makes things bigger/wider/more columns, never smaller.
2. **Does it survive 320px?** No fixed pixel widths on containers (`w-[420px]` → `w-full max-w-[420px]`). Long shelter names and email addresses must wrap or truncate, not overflow — reach for `min-w-0` on flex children and `break-words`/`truncate` on text.
3. **No horizontal scroll.** The page body must never scroll sideways. Wide content (a table, a long row of preset amount buttons) scrolls inside its own `overflow-x-auto` container.
4. **Touch targets ≥ 44px** on interactive elements — preset amount buttons, the country-code selector, step nav, checkbox+label hit area. shadcn's default `size="sm"` button is too small for a primary mobile action; use the default or `lg` size.
5. **Fluid over fixed**: `w-full`, `max-w-*`, `grid-cols-1 md:grid-cols-2`, `gap-*`, percentage/`fr` units — not hardcoded widths lifted from the Figma frame.
6. **Spacing scales too.** `p-4 md:p-8`, `gap-4 md:gap-6`, `text-2xl md:text-4xl` — desktop spacing crammed onto a phone is the most common Figma-translation bug.
7. **Sticky/fixed elements**: a fixed bottom CTA bar (common in donation wizards) needs matching bottom padding on the scroll container so it doesn't cover the last field, plus `pb-[env(safe-area-inset-bottom)]` awareness on iOS.

## Figma: mobile vs. desktop frames

The design file (`71F9aOieGNZNowSETLum7t` — see [[figma-design]]) may contain both mobile and desktop frames for the same screen.

- **Read the mobile frame first** and implement it as the unprefixed base, then layer desktop as `md:`/`lg:` variants. Doing it in the other order produces desktop-first classes almost every time.
- If **only a desktop frame exists** for a screen, do not guess a pixel-perfect mobile design — derive it by the standard reductions (multi-column → single column, side-by-side label/input → stacked, horizontal step indicator → compact/numeric, reduced padding and type scale) and mention to the user that the mobile layout was inferred.
- Pull spacing/type values via `get_variable_defs` into `@theme` tokens rather than hardcoding both a mobile and desktop pixel value per element.

## Donation wizard specifics

- **The form is a single column on mobile**, full-width fields. Only introduce two-column field pairing (e.g. name + surname) from `sm:`/`md:` up.
- **Step indicator**: horizontal labelled steps rarely fit at 320px — plan a compact variant (dots, or "Step 2 of 4") for the base and the full labelled version at `md:`.
- **Preset amount buttons**: `grid grid-cols-2 gap-3 sm:grid-cols-4` beats a flex row that overflows. Keep the custom-amount input full width beneath them.
- **Phone country-code selector** must stay tappable next to the number input at 320px — `flex` with the selector at fixed content width and the input `flex-1 min-w-0`.
- **Results/totals widget**: big numbers wrap badly — stack label above value on mobile, inline from `sm:` up.
- **Contact page**: single column, tappable `tel:`/`mailto:` links (they're better touch targets than plain text and are expected on mobile).

## Verifying

- `npm run build` and `npm run lint` don't catch layout problems — check visually.
- Use the [[run]] skill to start the dev server, then the browser tools (`claude-in-chrome`, `resize_window`) at ~375px, ~768px, and ~1280px widths before calling a screen done.
- Compare against the Figma frame at each breakpoint that has one; for widths with no frame, judge against the checklist above.
