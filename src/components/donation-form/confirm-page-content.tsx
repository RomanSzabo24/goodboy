"use client";

import { STEP_TRANSITION_CLASS } from "@/components/donation-form/constants";
import { useDonationWizard } from "@/components/donation-form/donation-wizard-context";
import { ConfirmStep } from "@/components/donation-form/confirm-step";

export function ConfirmPageContent() {
  const { form, shelters } = useDonationWizard();
  return <ConfirmStep form={form} shelters={shelters} className={STEP_TRANSITION_CLASS} />;
}
