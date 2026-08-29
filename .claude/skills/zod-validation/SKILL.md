---
name: zod-validation
description: Write or modify Zod v4 schemas for this project — donation form fields, cross-field rules, API response parsing — and wire them into react-hook-form via @hookform/resolvers. Use whenever touching src/lib/validations/, adding a validated field, changing a validation rule, or debugging why a form error does or doesn't appear.
---

# Zod validation — GoodBoy Foundation

`CLAUDE.md` mandates **Zod v4** schemas in `src/lib/validations/`, consumed by **react-hook-form v7** through **`@hookform/resolvers` v3+**. Zod v4 is a stretch-goal item in [docs/input/assignment.md](../../../docs/input/assignment.md) ("Form validation using a Zod schema") — i.e. graded.

Nothing is installed yet: `package.json` has no `zod`, `react-hook-form`, or `@hookform/resolvers`. Install them together, and **check that the `@hookform/resolvers` version you install actually supports Zod v4** — older resolver majors were built against Zod v3 and mistyped/misparsed v4 schemas. If `zodResolver(schema)` produces a type error against your form type, that's the version mismatch, not your schema.

## Zod v4 — don't write v3 out of habit

Most Zod knowledge in circulation is v3. In v4:

- **Top-level string formats replace the chained methods.** Use `z.email()`, `z.url()`, `z.uuid()`. The v3 forms `z.string().email()` etc. are deprecated — do not write them in new code. (The example in the [[api-integration]] skill still shows `z.string().email()`; prefer `z.email()` and treat that snippet as v3-era.)
- **Error customization is the `error` param**, which replaces v3's `message`, `required_error`, and `invalid_type_error`. `message` is still accepted in many positions, but be consistent — pick `error` and stay with it.
- Verify anything else you're unsure of against the installed package (`node_modules/zod`) or the v4 docs rather than recalling v3 semantics.

## The schema

Field rules come from `CLAUDE.md` §Business & Form Validation Logic — that section wins over anything a Figma frame implies:

| Field | Rule |
|---|---|
| `name` | **optional**, 2–20 chars *if provided* |
| `surname` | required, 2–30 chars |
| `email` | required, valid email |
| `phone` | required, SK `+421` or CZ `+420` |
| `consent` | required, must be `true` |
| `amount` | required, positive number |
| `shelterId` | required **only** when `helpType === "GIFT_SHELTER"` |

### Optional-with-constraints (`name`)

The classic bug: `z.string().min(2).max(20).optional()` rejects `""`, and an untouched text input submits `""`, not `undefined`. So an optional field the user never touched fails validation.

Handle the empty string explicitly — e.g. normalize `""` → `undefined` before the constraint, or union with `z.literal("")`. Whichever you pick, **write a unit test asserting `""` passes and `"a"` fails** ([[testing-strategy]]).

### Cross-field rule (`shelterId`)

`shelterId` depends on `helpType`, so it can't be expressed on the field alone — use `.refine()` (or `.superRefine()`) on the object and **set `path: ["shelterId"]`** so react-hook-form attaches the error to that field's `FormMessage` instead of dropping it at the form root. An error with no `path` is the usual reason "my validation runs but nothing shows in the UI".

Note the API accepts `shelterID: null` unconditionally — this rule exists **only** client-side ([[api-integration]]).

### Phone (SK/CZ)

Must accept `+421` and `+420` only, and the UI shows the matching country flag. Decide up front whether the schema validates the **full string including prefix** or a **separate prefix + national-number pair**, and keep the component shape and schema shape in agreement — mixing the two is where the flag indicator desyncs from validation. A regex like `/^\+(421|420)\s?\d{3}\s?\d{3}\s?\d{3}$/` covers the common formatting, but tolerate the spacing the input actually produces, and test both spaced and unspaced input.

### Numbers from inputs

`<input type="number">` yields a **string**. `z.number().positive()` will fail on `"500"`. Either coerce in the schema (`z.coerce.number()`) or use RHF's `valueAsNumber` on the field registration — pick one, don't stack both silently. Also guard against `NaN` from an empty numeric input.

## Types

Derive with `z.infer`, never hand-write a parallel interface:

```ts
export type DonationFormValues = z.infer<typeof donationFormSchema>;
```

Beware: with `.refine()` the schema type is a `ZodEffects`-style wrapper, so RHF's input vs. output types can diverge (notably with `z.coerce`). If `useForm` generics fight you, type the form on the **input** type and let the resolver produce the output type — don't paper over it with `any` (forbidden by `CLAUDE.md`).

## Wiring into react-hook-form

```ts
const form = useForm<DonationFormValues>({
  resolver: zodResolver(donationFormSchema),
  mode: "onBlur",           // or "onTouched" — see below
  defaultValues: { /* every field, no undefined -> uncontrolled input warnings */ },
});
```

- **Always supply complete `defaultValues`.** A field that starts `undefined` makes React switch the input from uncontrolled to controlled and drops the RHF/shadcn wiring.
- **Validation mode**: `"onChange"` shouts at the user mid-typing; `"onSubmit"` (the default) hides problems until the end of a multi-step wizard. `"onBlur"`/`"onTouched"` is the right default here, and it's what a graded "clearly notify the user of any errors" expects.
- **Multi-step**: validate per step with `form.trigger([...fieldsForThisStep])` before advancing, and run the full schema on final submit. Keep the single whole-form schema as the source of truth — derive per-step field lists from it rather than maintaining separate step schemas that can drift.
- Render errors through shadcn's `FormField`/`FormMessage` ([[shadcn-components]]) so the message is label-associated and announced.

## Validating API responses

Schemas aren't only for the form. When a response needs **runtime** validation (not just typing), parse it through a Zod schema mirroring `docs/input/openapi.json` — never a type assertion, and never `any`. Remember `results.contribution` is nullable, and `contribute` returns `messages[]` where an `ERROR` entry means failure despite HTTP 200.

## Testing

Schemas are pure functions — the cheapest, highest-value tests in the project. Cover, at minimum: empty `name` passes / 1-char fails / 21-char fails; `surname` boundaries; invalid email; `+421`, `+420`, and a rejected `+48`; `consent: false` fails; `amount` zero/negative/string; and both branches of the `shelterId` refine. See [[testing-strategy]].
