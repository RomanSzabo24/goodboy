import { create } from "zustand";

export const DONATION_STEPS = ["help-type", "amount", "details", "success"] as const;
export type DonationStep = (typeof DONATION_STEPS)[number];

type DonationFormStore = {
  step: DonationStep;
  goToStep: (step: DonationStep) => void;
  goNext: () => void;
  goBack: () => void;
  reset: () => void;
};

export const useDonationFormStore = create<DonationFormStore>((set) => ({
  step: DONATION_STEPS[0],
  goToStep: (step) => set({ step }),
  goNext: () =>
    set((state) => {
      const index = DONATION_STEPS.indexOf(state.step);
      const next = DONATION_STEPS[Math.min(index + 1, DONATION_STEPS.length - 1)];
      return { step: next };
    }),
  goBack: () =>
    set((state) => {
      const index = DONATION_STEPS.indexOf(state.step);
      const prev = DONATION_STEPS[Math.max(index - 1, 0)];
      return { step: prev };
    }),
  reset: () => set({ step: DONATION_STEPS[0] }),
}));
