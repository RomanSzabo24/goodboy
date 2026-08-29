import { describe, expect, it } from "vitest";

import { contributorSchema, donationFormSchema, skCzPhoneSchema } from "./donation";

const validContributor = {
  name: "",
  surname: "Dobry",
  email: "jan@example.com",
  phone: "+421 900 000 000",
  consent: true,
};

describe("skCzPhoneSchema", () => {
  it("accepts a spaced +421 number", () => {
    expect(skCzPhoneSchema.safeParse("+421 900 000 000").success).toBe(true);
  });

  it("accepts an unspaced +420 number", () => {
    expect(skCzPhoneSchema.safeParse("+420900000000").success).toBe(true);
  });

  it("rejects other country codes", () => {
    expect(skCzPhoneSchema.safeParse("+48 900 000 000").success).toBe(false);
  });

  it("rejects a missing country code", () => {
    expect(skCzPhoneSchema.safeParse("0900 000 000").success).toBe(false);
  });
});

describe("contributorSchema — name (optional, 2-20 chars)", () => {
  it("passes when name is empty", () => {
    const result = contributorSchema.safeParse({ ...validContributor, name: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBeUndefined();
  });

  it("fails when name is 1 character", () => {
    expect(contributorSchema.safeParse({ ...validContributor, name: "a" }).success).toBe(false);
  });

  it("passes when name is 2 characters", () => {
    expect(contributorSchema.safeParse({ ...validContributor, name: "Jo" }).success).toBe(true);
  });

  it("fails when name exceeds 20 characters", () => {
    expect(
      contributorSchema.safeParse({ ...validContributor, name: "a".repeat(21) }).success,
    ).toBe(false);
  });
});

describe("contributorSchema — surname (required, 2-30 chars)", () => {
  it("fails when surname is empty", () => {
    expect(contributorSchema.safeParse({ ...validContributor, surname: "" }).success).toBe(false);
  });

  it("fails when surname is 1 character", () => {
    expect(contributorSchema.safeParse({ ...validContributor, surname: "a" }).success).toBe(
      false,
    );
  });

  it("fails when surname exceeds 30 characters", () => {
    expect(
      contributorSchema.safeParse({ ...validContributor, surname: "a".repeat(31) }).success,
    ).toBe(false);
  });
});

describe("contributorSchema — email", () => {
  it("fails on an invalid email", () => {
    expect(contributorSchema.safeParse({ ...validContributor, email: "not-an-email" }).success).toBe(
      false,
    );
  });
});

describe("contributorSchema — consent", () => {
  it("fails when consent is false", () => {
    expect(contributorSchema.safeParse({ ...validContributor, consent: false }).success).toBe(
      false,
    );
  });

  it("passes when consent is true", () => {
    expect(contributorSchema.safeParse({ ...validContributor, consent: true }).success).toBe(
      true,
    );
  });
});

describe("donationFormSchema — amount", () => {
  const base = {
    helpType: "GIFT_FOUNDATION" as const,
    contributors: [validContributor],
  };

  it("fails on zero", () => {
    expect(donationFormSchema.safeParse({ ...base, amount: 0 }).success).toBe(false);
  });

  it("fails on negative amounts", () => {
    expect(donationFormSchema.safeParse({ ...base, amount: -5 }).success).toBe(false);
  });

  it("passes on a positive amount", () => {
    expect(donationFormSchema.safeParse({ ...base, amount: 10 }).success).toBe(true);
  });
});

describe("donationFormSchema — shelterId cross-field rule", () => {
  it("requires shelterId when helpType is GIFT_SHELTER", () => {
    const result = donationFormSchema.safeParse({
      helpType: "GIFT_SHELTER",
      amount: 10,
      contributors: [validContributor],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["shelterId"]);
    }
  });

  it("passes without shelterId when helpType is GIFT_FOUNDATION", () => {
    const result = donationFormSchema.safeParse({
      helpType: "GIFT_FOUNDATION",
      amount: 10,
      contributors: [validContributor],
    });
    expect(result.success).toBe(true);
  });

  it("passes when helpType is GIFT_SHELTER and shelterId is provided", () => {
    const result = donationFormSchema.safeParse({
      helpType: "GIFT_SHELTER",
      shelterId: 4,
      amount: 10,
      contributors: [validContributor],
    });
    expect(result.success).toBe(true);
  });
});
