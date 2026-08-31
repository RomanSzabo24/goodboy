"use client";

import { STEP_TRANSITION_CLASS } from "@/components/donation-form/constants";
import { useDonationWizard } from "@/components/donation-form/donation-wizard-context";
import { ShelterStep } from "@/components/donation-form/shelter-step";

export function ShelterPageContent() {
  const { form, shelters } = useDonationWizard();
  return <ShelterStep form={form} shelters={shelters} className={STEP_TRANSITION_CLASS} />;
}
