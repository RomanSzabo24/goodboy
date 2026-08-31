"use client";

import { useDonationWizard } from "@/components/donation-form/donation-wizard-context";
import { SuccessStep } from "@/components/donation-form/success-step";

export function SuccessPageContent() {
  const { successMessages, onDonateAgain } = useDonationWizard();
  return <SuccessStep messages={successMessages} onDonateAgain={onDonateAgain} />;
}
