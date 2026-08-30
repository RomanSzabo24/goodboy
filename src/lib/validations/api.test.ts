import { describe, expect, it } from "vitest";

import {
  contributeResponseSchema,
  resultsResponseSchema,
  sheltersResponseSchema,
} from "./api";

describe("sheltersResponseSchema", () => {
  it("parses a list of shelters", () => {
    const result = sheltersResponseSchema.safeParse({
      shelters: [{ id: 4, name: "Útulok pre psov - TEZAS" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a shelter missing a name", () => {
    const result = sheltersResponseSchema.safeParse({ shelters: [{ id: 4 }] });
    expect(result.success).toBe(false);
  });
});

describe("resultsResponseSchema", () => {
  it("accepts a null contribution (no donations yet)", () => {
    const result = resultsResponseSchema.safeParse({ contributors: 0, contribution: null });
    expect(result.success).toBe(true);
  });

  it("accepts a numeric contribution", () => {
    const result = resultsResponseSchema.safeParse({ contributors: 4, contribution: 7.5 });
    expect(result.success).toBe(true);
  });

  it("rejects a missing contributors count", () => {
    const result = resultsResponseSchema.safeParse({ contribution: 7.5 });
    expect(result.success).toBe(false);
  });
});

describe("contributeResponseSchema", () => {
  it("accepts every documented message type", () => {
    const result = contributeResponseSchema.safeParse({
      messages: [
        { message: "ok", type: "SUCCESS" },
        { message: "heads up", type: "WARNING" },
        { message: "fyi", type: "INFO" },
        { message: "failed", type: "ERROR" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown message type", () => {
    const result = contributeResponseSchema.safeParse({
      messages: [{ message: "ok", type: "UNKNOWN" }],
    });
    expect(result.success).toBe(false);
  });
});
