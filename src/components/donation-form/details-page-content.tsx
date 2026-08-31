"use client";

import { STEP_TRANSITION_CLASS } from "@/components/donation-form/constants";
import { useDonationWizard } from "@/components/donation-form/donation-wizard-context";
import { PersonalDetailsStep } from "@/components/donation-form/personal-details-step";

export function DetailsPageContent() {
  const { form } = useDonationWizard();
  return <PersonalDetailsStep form={form} className={STEP_TRANSITION_CLASS} />;
}
