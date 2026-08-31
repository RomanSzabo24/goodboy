export const DONATION_STEPS = ["shelter", "details", "confirm", "success"] as const;
export type DonationStep = (typeof DONATION_STEPS)[number];

// Each step now lives at its own route so `generateMetadata` can give it a
// real, distinct SSR title/description (the assignment's SEO bonus asks for
// "various titles and descriptions on different form steps") — the shelter
// step stays at "/" so the landing page needs no redirect.
export const STEP_PATHS: Record<DonationStep, string> = {
  shelter: "/",
  details: "/donate/details",
  confirm: "/donate/confirm",
  success: "/donate/success",
};

export function stepFromPathname(pathname: string): DonationStep {
  const match = (Object.entries(STEP_PATHS) as [DonationStep, string][]).find(
    ([, path]) => path === pathname,
  );
  return match?.[0] ?? "shelter";
}

// Each step is a different route now, so it always fully mounts on
// navigation — this entrance animation replays on every step change for free.
export const STEP_TRANSITION_CLASS = "animate-in fade-in-0 slide-in-from-right-2 duration-300";
