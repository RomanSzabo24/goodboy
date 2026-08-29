import type { UseFormReturn } from "react-hook-form";

import type { DonationFormInput, DonationFormValues } from "@/lib/validations/donation";

export type DonationFormApi = UseFormReturn<DonationFormInput, unknown, DonationFormValues>;
