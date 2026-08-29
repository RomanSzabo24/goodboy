---
name: api-integration
description: Build or modify the data layer against the GoodBoy Foundation donation API (shelters list, results, contribute) — services, Zod schemas, TanStack Query hooks, and the mapping between form fields and the OpenAPI request/response shapes. Use whenever adding/editing anything under src/services, src/lib/validations, or a TanStack Query hook that talks to frontend-assignment-api.goodrequest.dev.
---

# API Integration — GoodBoy Foundation donation API

Source of truth: [docs/input/openapi.json](../../../docs/input/openapi.json) (OpenAPI 3.1, checked in — re-read it if a shape here looks stale). Business rules: [docs/input/assignment.md](../../../docs/input/assignment.md) and the root `CLAUDE.md`.

Base URL: `https://frontend-assignment-api.goodrequest.dev` (no auth — every endpoint has `"security": []`).

## Endpoint reference

| Endpoint | Method | Purpose | Query/Body | Response |
|---|---|---|---|---|
| `/api/v1/shelters/` | GET | List participating shelters | `search?: string` | `{ shelters: { id: number; name: string }[] }` |
| `/api/v1/shelters/results` | GET | Aggregate totals (poll for live updates) | `search?: string` | `{ contributors: number; contribution: number \| null }` |
| `/api/v1/shelters/contribute` | POST | Submit a donation | see below | `{ messages: { message: string; type: "ERROR" \| "WARNING" \| "INFO" \| "SUCCESS" }[] }` |

**Contribute request body:**
```ts
{
  contributors: { firstName: string; lastName: string; email: string; phone?: string | null }[]; // required, 1+
  shelterID?: number | null; // omit/null = general donation (GIFT_FOUNDATION); set = GIFT_SHELTER
  value: number; // required, minimum 0
}
```

Notes:
- The API has no `helpType` field — `GIFT_FOUNDATION` vs `GIFT_SHELTER` (from `CLAUDE.md`) is a **client-only** concept that resolves to `shelterID: null` vs `shelterID: <id>` before sending. Enforce "shelterID mandatory when GIFT_SHELTER" in the Zod schema, not by relying on the API (it accepts `null` unconditionally).
- `contributors` is an array — this is the hook for the "allow adding multiple donors" stretch goal. Don't collapse it to a single object even for the base case; keep the form's contributor data as a length-1 array by default.
- The 200 response for `contribute` is **not** a success/failure boolean — inspect `messages[].type`. Treat any `ERROR` entry as a failed submission even though the HTTP status is 200; surface `SUCCESS`/`INFO`/`WARNING` messages as toasts/inline notices using their `message` text.
- `results.contribution` is nullable (no donations yet) — render a zero/empty state, don't assume a number.
- `search` on `/shelters/` and `/shelters/results` is optional — only wire it up if you're building shelter search/filter UI.

## File layout (per CLAUDE.md)

```
src/services/shelters.ts        # fetch wrappers, one per endpoint
src/lib/validations/donation.ts # Zod schemas
src/hooks/ (or colocated)       # TanStack Query hooks wrapping services
```

## Types + Zod schema

Derive TS types from the Zod schemas (`z.infer`), don't hand-duplicate types. Example shape for the donation form schema — adjust field names to match whatever the form components actually use, but keep these constraints:

```ts
// src/lib/validations/donation.ts
import { z } from "zod";

export const helpTypeSchema = z.enum(["GIFT_FOUNDATION", "GIFT_SHELTER"]);

export const skCzPhoneSchema = z
  .string()
  .regex(/^\+(421|420)\s?\d{3}\s?\d{3}\s?\d{3}$/, "Invalid SK/CZ phone number");

export const contributorSchema = z.object({
  name: z.string().min(2).max(20).optional(),
  surname: z.string().min(2).max(30),
  email: z.string().email(),
  phone: skCzPhoneSchema,
  consent: z.literal(true),
});

export const donationFormSchema = z
  .object({
    helpType: helpTypeSchema,
    shelterId: z.number().optional(),
    amount: z.number().positive(),
    contributors: z.array(contributorSchema).min(1),
  })
  .refine((data) => data.helpType !== "GIFT_SHELTER" || data.shelterId != null, {
    message: "Shelter is required for a shelter-specific donation",
    path: ["shelterId"],
  });

export type DonationFormValues = z.infer<typeof donationFormSchema>;
```

Map `DonationFormValues` → API body at the service boundary, not inside the form:
```ts
const toContributeBody = (values: DonationFormValues) => ({
  contributors: values.contributors.map(({ name, surname, email, phone }) => ({
    firstName: name ?? "",
    lastName: surname,
    email,
    phone,
  })),
  shelterID: values.helpType === "GIFT_SHELTER" ? values.shelterId : null,
  value: values.amount,
});
```

## Services

Plain fetch wrappers, no React/Query imports here:

```ts
// src/services/shelters.ts
const BASE_URL = "https://frontend-assignment-api.goodrequest.dev";

export type Shelter = { id: number; name: string };
export type SheltersResponse = { shelters: Shelter[] };
export type ResultsResponse = { contributors: number; contribution: number | null };
export type ContributeMessage = { message: string; type: "ERROR" | "WARNING" | "INFO" | "SUCCESS" };
export type ContributeResponse = { messages: ContributeMessage[] };

export async function getShelters(search?: string): Promise<SheltersResponse> {
  const url = new URL(`${BASE_URL}/api/v1/shelters/`);
  if (search) url.searchParams.set("search", search);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch shelters: ${res.status}`);
  return res.json();
}

export async function getSheltersResults(search?: string): Promise<ResultsResponse> {
  const url = new URL(`${BASE_URL}/api/v1/shelters/results`);
  if (search) url.searchParams.set("search", search);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch results: ${res.status}`);
  return res.json();
}

export async function postContribute(body: unknown): Promise<ContributeResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/shelters/contribute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to submit contribution: ${res.status}`);
  return res.json();
}
```

## TanStack Query hooks

```ts
// src/hooks/use-shelters.ts
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getShelters, getSheltersResults, postContribute } from "@/services/shelters";

export const sheltersKeys = {
  list: (search?: string) => ["shelters", "list", search] as const,
  results: (search?: string) => ["shelters", "results", search] as const,
};

export function useShelters(search?: string) {
  return useQuery({
    queryKey: sheltersKeys.list(search),
    queryFn: () => getShelters(search),
  });
}

export function useSheltersResults(search?: string) {
  return useQuery({
    queryKey: sheltersKeys.results(search),
    queryFn: () => getSheltersResults(search),
    refetchInterval: 30_000, // "regularly updated" per assignment.md — poll, no websocket/SSE exists
  });
}

export function useContribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postContribute,
    onSuccess: (data) => {
      if (data.messages.some((m) => m.type === "ERROR")) return; // let caller inspect messages
      queryClient.invalidateQueries({ queryKey: ["shelters", "results"] });
    },
  });
}
```

- Fetch the shelters list and initial results **on the server** (Server Component, `fetch` directly or a server-side prefetch into a `HydrationBoundary`) where the route allows it, per "Use React Server Components by default." Reserve `"use client"` hooks above for interactive pieces (shelter picker inside the form, the live-updating results counter).
- Query keys live in one place (`sheltersKeys`) so invalidation after a successful contribution stays consistent — don't inline ad-hoc key arrays at call sites.
- Never use `any`: if a response shape needs runtime validation (not just typing), parse it through a Zod schema mirroring the OpenAPI response, not a type assertion.
