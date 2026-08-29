import type { DonationFormValues } from "@/lib/validations/donation";

const BASE_URL = "https://frontend-assignment-api.goodrequest.dev";

export type Shelter = { id: number; name: string };
export type SheltersResponse = { shelters: Shelter[] };
export type ResultsResponse = { contributors: number; contribution: number | null };
export type ContributeMessage = {
  message: string;
  type: "ERROR" | "WARNING" | "INFO" | "SUCCESS";
};
export type ContributeResponse = { messages: ContributeMessage[] };
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
  return res.json();
}

export async function getSheltersResults(search?: string): Promise<ResultsResponse> {
  const url = new URL(`${BASE_URL}/api/v1/shelters/results`);
  if (search) url.searchParams.set("search", search);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch results: ${res.status}`);
  return res.json();
}

export async function postContribute(body: ContributeBody): Promise<ContributeResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/shelters/contribute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to submit contribution: ${res.status}`);
  return res.json();
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
    shelterID: values.helpType === "GIFT_SHELTER" ? values.shelterId : null,
    value: values.amount,
  };
}
