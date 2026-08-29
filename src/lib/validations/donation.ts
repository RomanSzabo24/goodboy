import { z } from "zod";

export const helpTypeSchema = z.enum(["GIFT_FOUNDATION", "GIFT_SHELTER"]);
export type HelpType = z.infer<typeof helpTypeSchema>;

/** Accepts +421/+420 with optional spaces between the 3-3-3 digit groups. */
export const skCzPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+(421|420)\s?\d{3}\s?\d{3}\s?\d{3}$/, {
    error: "Enter a valid SK (+421) or CZ (+420) phone number",
  });

/**
 * Optional 2-20 char field. An untouched controlled input submits "", which
 * must pass; "" is transformed to undefined so downstream consumers see a
 * real optional value instead of an empty string.
 */
const optionalNameSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || (value.length >= 2 && value.length <= 20), {
    error: "Name must be 2-20 characters",
  })
  .transform((value) => (value === "" ? undefined : value));

export const contributorSchema = z.object({
  name: optionalNameSchema,
  surname: z
    .string()
    .trim()
    .min(2, { error: "Surname must be at least 2 characters" })
    .max(30, { error: "Surname must be at most 30 characters" }),
  email: z.email({ error: "Enter a valid e-mail address" }),
  phone: skCzPhoneSchema,
  consent: z
    .boolean()
    .refine((value) => value === true, {
      error: "You must consent to personal data processing",
    }),
});

export const donationFormSchema = z
  .object({
    helpType: helpTypeSchema,
    shelterId: z.number().int().positive().optional(),
    amount: z
      .number({ error: "Enter a donation amount" })
      .positive({ error: "Amount must be greater than 0" }),
    contributors: z.array(contributorSchema).min(1),
  })
  .refine((data) => data.helpType !== "GIFT_SHELTER" || data.shelterId != null, {
    error: "Please choose a shelter",
    path: ["shelterId"],
  });

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
      consent: false,
    },
  ],
};
