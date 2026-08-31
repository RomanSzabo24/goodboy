import {
  contributeResponseSchema,
  resultsResponseSchema,
  sheltersResponseSchema,
} from "@/lib/validations/api";
import type {
  ContributeMessage,
  ContributeResponse,
  ResultsResponse,
  Shelter,
  SheltersResponse,
} from "@/lib/validations/api";
import type { DonationFormValues } from "@/lib/validations/donation";

export type { ContributeMessage, ContributeResponse, ResultsResponse, Shelter, SheltersResponse };

const BASE_URL = "https://frontend-assignment-api.goodrequest.dev";

export type ContributeBody = {
  contributors: { firstName: string; lastName: string; email: string; phone?: string | null }[];
  shelterID?: number | null;
  value: number;
};

export async function getShelters(search?: string): Promise<SheltersResponse> {
  const url = new URL(`${BASE_URL}/api/v1/shelters/`);
  if (search) url.searchParams.set("search", search);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch shelters: ${res.status}`);
  const result = sheltersResponseSchema.safeParse(await res.json());
  if (!result.success) throw new Error(`Invalid shelters response: ${result.error.message}`);
  return result.data;
}

export async function getSheltersResults(search?: string): Promise<ResultsResponse> {
  const url = new URL(`${BASE_URL}/api/v1/shelters/results`);
  if (search) url.searchParams.set("search", search);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch results: ${res.status}`);
  const result = resultsResponseSchema.safeParse(await res.json());
  if (!result.success) throw new Error(`Invalid results response: ${result.error.message}`);
  return result.data;
}

export async function postContribute(body: ContributeBody): Promise<ContributeResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/shelters/contribute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to submit contribution: ${res.status}`);
  const result = contributeResponseSchema.safeParse(await res.json());
  if (!result.success) throw new Error(`Invalid contribute response: ${result.error.message}`);
  return result.data;
}

/**
 * `contribute` always returns HTTP 200 — a failed submission surfaces only as
 * an `ERROR` entry in `messages[]`, so callers must check this explicitly.
 */
export function getContributeError(response: ContributeResponse): ContributeMessage | undefined {
  return response.messages.find((message) => message.type === "ERROR");
}

/** Maps validated form values to the API request shape. */
export function toContributeBody(values: DonationFormValues): ContributeBody {
  return {
    contributors: values.contributors.map(({ name, surname, email, phone }) => ({
      firstName: name ?? "",
      lastName: surname,
      email,
      phone,
    })),
    // The shelter picker stays available (and optional) for a general
    // donation too — send whatever was actually chosen rather than gating
    // on helpType, so a shelter picked during a general donation still
    // reaches the API instead of being silently dropped.
    shelterID: values.shelterId ?? null,
    value: values.amount,
  };
}
