---
name: commit-conventions
description: Write a commit message (or PR title) consistent with this repo's history — Conventional Commits type prefixes, no scopes, imperative subject. Use whenever creating a git commit, drafting a PR title, or unsure which type (feat/fix/docs/chore/refactor/test/style) fits a change.
---

# Commit message convention — GoodBoy Foundation

The existing history (`git log`) already follows [Conventional Commits](https://www.conventionalcommits.org/), no scopes:

```
feat: add next-intl i18n (sk default, en)
chore: install core dependencies and configure tooling
docs: add project skills for API, Figma and stack
docs: add CLAUDE.md and input documentation
chore: initial project setup
```

Match that pattern exactly rather than inventing a new format.

## Format

```
<type>: <imperative, lowercase summary, no trailing period>

<optional body, wrapped ~72 chars>
```

- **No scope** (`feat(donation-form):` etc.) — none of the existing commits use one; don't introduce it unless the user asks.
- **Subject in imperative mood**: "add", "fix", "wire up" — not "added", "adds", "adding".
- **Lowercase after the colon**, no trailing period, aim for ≤72 chars.
- **One logical change per commit.** Don't bundle an unrelated `fix` into a `feat` commit just because they landed together.

## Choosing a type

| Type | Use for | Example in this repo's shape |
|---|---|---|
| `feat` | New user-facing behavior or route/component/schema | `feat: add shelter selection step to donation form` |
| `fix` | Correcting broken behavior (a bug, a wrong validation rule) | `fix: allow empty name field to pass validation` |
| `refactor` | Restructuring code with no behavior change | `refactor: extract phone regex into shared constant` |
| `test` | Adding/updating tests only | `test: cover SK/CZ phone validation edge cases` |
| `docs` | `CLAUDE.md`, `.claude/skills/*`, `docs/**`, README | `docs: add commit-conventions skill` |
| `style` | Formatting/whitespace only, no logic change | `style: run prettier on donation-form components` |
| `chore` | Tooling, deps, config — installing a shadcn primitive, editing `next.config.ts` | `chore: add shadcn dialog component` |

`build`/`ci`/`perf` exist in the spec too, but skip them until there's actually a build pipeline or a perf-motivated change to name — don't reach for a type this repo has no use for yet.

## When to add a body

Only when the summary line can't carry the **why**. Same rule as this project's code-comment policy in `CLAUDE.md` — explain the non-obvious reason, not a restatement of the diff. The `next-intl` commit is the model to follow:

> Localize the donation form and site copy so Slovak visitors see Slovak by default, with English available as a switchable second locale.

Not: "Add next-intl package and wrap layout in NextIntlClientProvider" — that's visible from the diff already.


