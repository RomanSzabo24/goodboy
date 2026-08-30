import { describe, expect, it } from "vitest";

import { flattenFieldErrors, getFieldErrorMessages } from "./form-errors";

describe("flattenFieldErrors", () => {
  it("returns an empty array for no errors", () => {
    expect(flattenFieldErrors(undefined)).toEqual([]);
    expect(flattenFieldErrors({})).toEqual([]);
  });

  it("collects top-level leaf messages", () => {
    const errors = {
      amount: { type: "custom", message: "Amount must be greater than 0" },
      shelterId: { type: "custom", message: "Please choose a shelter" },
    };
    expect(flattenFieldErrors(errors)).toEqual([
      "Amount must be greater than 0",
      "Please choose a shelter",
    ]);
  });

  it("descends into nested array fields like contributors[]", () => {
    const errors = {
      contributors: [
        { surname: { type: "custom", message: "Surname must be at least 2 characters" } },
        { email: { type: "custom", message: "Enter a valid e-mail address" } },
      ],
    };
    expect(flattenFieldErrors(errors)).toEqual([
      "Surname must be at least 2 characters",
      "Enter a valid e-mail address",
    ]);
  });

  it("deduplicates repeated messages across donors", () => {
    const errors = {
      contributors: [
        { surname: { type: "custom", message: "Surname must be at least 2 characters" } },
        { surname: { type: "custom", message: "Surname must be at least 2 characters" } },
      ],
    };
    expect(flattenFieldErrors(errors)).toEqual(["Surname must be at least 2 characters"]);
  });

  it("does not descend into a FieldError's own ref/type properties", () => {
    const errors = {
      amount: { type: "custom", message: "Amount must be greater than 0", ref: { focus: () => {} } },
    };
    expect(flattenFieldErrors(errors)).toEqual(["Amount must be greater than 0"]);
  });
});

describe("getFieldErrorMessages", () => {
  it("only collects messages for the given fields", () => {
    const errors = {
      amount: { type: "custom", message: "Amount must be greater than 0" },
      consent: { type: "custom", message: "You must consent to personal data processing" },
    };
    expect(getFieldErrorMessages(errors, ["amount"])).toEqual(["Amount must be greater than 0"]);
  });

  it("returns an empty array when the field has no error", () => {
    expect(getFieldErrorMessages({}, ["amount"])).toEqual([]);
  });
});
