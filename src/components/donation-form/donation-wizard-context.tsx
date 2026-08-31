"use client";

import { createContext, useContext } from "react";

import type { DonationFormApi } from "@/components/donation-form/types";
import type { ContributeMessage, Shelter } from "@/services/shelters";

export type DonationWizardContextValue = {
  form: DonationFormApi;
  shelters: Shelter[];
  successMessages: ContributeMessage[];
  onDonateAgain: () => void;
};

const DonationWizardContext = createContext<DonationWizardContextValue | null>(null);

export const DonationWizardContextProvider = DonationWizardContext.Provider;

// Each wizard step now lives behind its own route (see constants.ts), so the
// form instance can't be created in each step's own `page.tsx` — it has to
// live in the shared `(donation)/layout.tsx` tree so it survives navigation
// between steps. This context is how the per-route step content reaches it.
export function useDonationWizard() {
  const value = useContext(DonationWizardContext);
  if (!value) {
    throw new Error("useDonationWizard must be used within DonationWizardProvider");
  }
  return value;
}
