import { z } from "zod";

export const helpTypeSchema = z.enum(["GIFT_FOUNDATION", "GIFT_SHELTER"]);
export type HelpType = z.infer<typeof helpTypeSchema>;

/** Localizable copies of every validation message, keyed to the `validation` message namespace. */
export type ValidationMessages = {
  phoneInvalid: string;
  nameLength: string;
  surnameMin: string;
  surnameMax: string;
  emailInvalid: string;
  consentRequired: string;
  amountRequired: string;
  amountPositive: string;
  shelterRequired: string;
};

export const defaultValidationMessages: ValidationMessages = {
  phoneInvalid: "Enter a valid SK (+421) or CZ (+420) phone number",
  nameLength: "Name must be 2-20 characters",
  surnameMin: "Surname must be at least 2 characters",
  surnameMax: "Surname must be at most 30 characters",
  emailInvalid: "Enter a valid e-mail address",
  consentRequired: "You must consent to personal data processing",
  amountRequired: "Enter a donation amount",
  amountPositive: "Amount must be greater than 0",
  shelterRequired: "Please choose a shelter",
};

/** Accepts +421/+420 with optional spaces between the 3-3-3 digit groups. */
export function createPhoneSchema(messages: ValidationMessages = defaultValidationMessages) {
  return z
    .string()
    .trim()
    .regex(/^\+(421|420)\s?\d{3}\s?\d{3}\s?\d{3}$/, {
      error: messages.phoneInvalid,
    });
}
export const skCzPhoneSchema = createPhoneSchema();

/**
 * Optional 2-20 char field. An untouched controlled input submits "", which
 * must pass; "" is transformed to undefined so downstream consumers see a
 * real optional value instead of an empty string.
 */
function createOptionalNameSchema(messages: ValidationMessages) {
  return z
    .string()
    .trim()
    .refine((value) => value === "" || (value.length >= 2 && value.length <= 20), {
      error: messages.nameLength,
    })
    .transform((value) => (value === "" ? undefined : value));
}

export function createContributorSchema(messages: ValidationMessages = defaultValidationMessages) {
  return z.object({
    name: createOptionalNameSchema(messages),
    surname: z
      .string()
      .trim()
      .min(2, { error: messages.surnameMin })
      .max(30, { error: messages.surnameMax }),
    email: z.email({ error: messages.emailInvalid }),
    phone: createPhoneSchema(messages),
  });
}
export const contributorSchema = createContributorSchema();

export function createDonationFormSchema(messages: ValidationMessages = defaultValidationMessages) {
  return z
    .object({
      helpType: helpTypeSchema,
      shelterId: z.number().int().positive().optional(),
      amount: z
        .number({ error: messages.amountRequired })
        .positive({ error: messages.amountPositive }),
      contributors: z.array(createContributorSchema(messages)).min(1),
      // A single consent checkbox on the confirmation step covers the whole
      // submission (matches Figma's "Potvrdenie" step) rather than one per donor.
      consent: z.boolean().refine((value) => value === true, {
        error: messages.consentRequired,
      }),
    })
    .refine((data) => data.helpType !== "GIFT_SHELTER" || data.shelterId != null, {
      error: messages.shelterRequired,
      path: ["shelterId"],
    });
}
export const donationFormSchema = createDonationFormSchema();

/** Shape react-hook-form works with (pre-validation/coercion). */
export type DonationFormInput = z.input<typeof donationFormSchema>;
/** Shape available after successful validation (post-coercion/transform). */
export type DonationFormValues = z.output<typeof donationFormSchema>;
export type Contributor = z.output<typeof contributorSchema>;

export const donationFormDefaultValues: DonationFormInput = {
  helpType: "GIFT_FOUNDATION",
  shelterId: undefined,
  amount: 0,
  contributors: [
    {
      name: "",
      surname: "",
      email: "",
      phone: "",
    },
  ],
  consent: false,
};
