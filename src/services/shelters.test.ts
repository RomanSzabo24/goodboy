import { describe, expect, it } from "vitest";

import { getContributeError, toContributeBody } from "./shelters";
import type { ContributeResponse } from "./shelters";
import type { DonationFormValues } from "@/lib/validations/donation";

describe("toContributeBody", () => {
  const baseValues: DonationFormValues = {
    helpType: "GIFT_FOUNDATION",
    amount: 15,
    contributors: [
      { name: undefined, surname: "Dobry", email: "jan@example.com", phone: "+421 900 000 000" },
    ],
    consent: true,
  };

  it("maps GIFT_FOUNDATION to a null shelterID", () => {
    const body = toContributeBody(baseValues);
    expect(body.shelterID).toBeNull();
    expect(body.value).toBe(15);
  });

  it("maps GIFT_SHELTER to the chosen shelterID", () => {
    const body = toContributeBody({ ...baseValues, helpType: "GIFT_SHELTER", shelterId: 4 });
    expect(body.shelterID).toBe(4);
  });

  it("maps contributors to firstName/lastName, defaulting an absent name to an empty string", () => {
    const body = toContributeBody(baseValues);
    expect(body.contributors).toEqual([
      { firstName: "", lastName: "Dobry", email: "jan@example.com", phone: "+421 900 000 000" },
    ]);
  });
});

describe("getContributeError", () => {
  it("returns undefined when there are no ERROR messages", () => {
    const response: ContributeResponse = {
      messages: [{ type: "SUCCESS", message: "Thanks!" }],
    };
    expect(getContributeError(response)).toBeUndefined();
  });

  it("returns the ERROR message even though the HTTP status is 200", () => {
    const response: ContributeResponse = {
      messages: [
        { type: "INFO", message: "Processing" },
        { type: "ERROR", message: "Something went wrong" },
      ],
    };
    expect(getContributeError(response)?.message).toBe("Something went wrong");
  });
});
