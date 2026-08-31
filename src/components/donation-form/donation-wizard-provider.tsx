"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useForm, type Path } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/donation-form/step-indicator";
import { DonationWizardContextProvider } from "@/components/donation-form/donation-wizard-context";
import { DONATION_STEPS, STEP_PATHS, stepFromPathname } from "@/components/donation-form/constants";
import { useContribute } from "@/hooks/use-shelters";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  contributorSchema,
  createDonationFormSchema,
  donationFormDefaultValues,
  type DonationFormInput,
  type DonationFormValues,
} from "@/lib/validations/donation";
import {
  getContributeError,
  toContributeBody,
  type ContributeMessage,
  type Shelter,
} from "@/services/shelters";

const STEP_FIELDS: Record<string, Path<DonationFormInput>[]> = {
  shelter: ["helpType", "shelterId", "amount"],
  details: ["contributors"],
  confirm: ["consent"],
};

export function DonationWizardProvider({
  shelters,
  footer,
  children,
}: {
  shelters: Shelter[];
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = useTranslations("form");
  const tValidation = useTranslations("validation");
  const pathname = usePathname();
  const router = useRouter();
  const step = stepFromPathname(pathname);
  const stepIndex = DONATION_STEPS.indexOf(step);
  const contribute = useContribute();
  const [successMessages, setSuccessMessages] = useState<ContributeMessage[]>([]);

  const donationFormSchema = useMemo(
    () =>
      createDonationFormSchema({
        phoneInvalid: tValidation("phoneInvalid"),
        nameLength: tValidation("nameLength"),
        surnameMin: tValidation("surnameMin"),
        surnameMax: tValidation("surnameMax"),
        emailInvalid: tValidation("emailInvalid"),
        consentRequired: tValidation("consentRequired"),
        amountRequired: tValidation("amountRequired"),
        amountPositive: tValidation("amountPositive"),
        shelterRequired: tValidation("shelterRequired"),
      }),
    [tValidation],
  );

  const form = useForm<DonationFormInput, unknown, DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    mode: "onBlur",
    defaultValues: donationFormDefaultValues,
  });

  // Every control that can be invalid also gets `aria-invalid`, so after a
  // failed validation attempt the first offending control can always be
  // found generically instead of maintaining a per-step ref map.
  const stepContentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  function focusFirstInvalidField() {
    stepContentRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }

  // Each step now has its own bookmarkable/shareable URL, so a user can land
  // on `details`/`confirm`/`success` directly (a stale bookmark, a manual
  // reload, typing the URL) without having gone through the earlier steps in
  // this session — the in-memory form would just be empty defaults then.
  // This is a lightweight proxy check (not full validation — the real
  // per-field validation still runs via zodResolver on trigger/submit), just
  // enough to avoid showing a confirm/success screen that can't make sense.
  useEffect(() => {
    if ((step === "details" || step === "confirm") && !(form.getValues("amount") > 0)) {
      router.replace(STEP_PATHS.shelter);
      return;
    }
    if (step === "confirm" && !contributorSchema.safeParse(form.getValues("contributors")[0]).success) {
      router.replace(STEP_PATHS.details);
      return;
    }
    if (step === "success" && successMessages.length === 0) {
      router.replace(STEP_PATHS.shelter);
    }
    // Only re-check when the step actually changes — re-running on every
    // keystroke would fight the user while they're still filling a step in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Move focus to the new step's heading on every step change so keyboard
  // and screen-reader users get a clear signal the view advanced, without
  // stealing focus from the URL bar on the initial page load.
  // (Title/description no longer need a manual client-side sync here — each
  // step is a real route with its own `generateMetadata` now, and Next's App
  // Router updates `document.title` itself on client-side navigation.)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "start" });
  }, [step]);

  async function handleNext() {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (valid) {
      router.push(STEP_PATHS[DONATION_STEPS[stepIndex + 1]]);
      return;
    }
    requestAnimationFrame(focusFirstInvalidField);
  }

  function handleBack() {
    router.push(STEP_PATHS[DONATION_STEPS[Math.max(stepIndex - 1, 0)]]);
  }

  async function handleSubmit(values: DonationFormValues) {
    try {
      const response = await contribute.mutateAsync(toContributeBody(values));
      const errorMessage = getContributeError(response);
      if (errorMessage) {
        toast.error(errorMessage.message);
        return;
      }
      response.messages.forEach((message) => {
        if (message.type !== "ERROR") toast.success(message.message);
      });
      setSuccessMessages(response.messages);
      router.push(STEP_PATHS.success);
    } catch {
      toast.error(t("submitError"));
    }
  }

  function handleDonateAgain() {
    form.reset(donationFormDefaultValues);
    setSuccessMessages([]);
    router.replace(STEP_PATHS.shelter);
  }

  // Deliberately NOT memoized: `form` (the object react-hook-form returns)
  // keeps the same reference across renders even when `form.formState.errors`
  // changes internally via its own Proxy-based subscription — memoizing this
  // on [form, shelters, successMessages] would make the context value's
  // identity never change on validation, so the step content (a separate
  // route's page component, reached via `children` rather than created here)
  // would never see the new errors. This object is cheap enough to recreate
  // every render; React Context only re-renders actual consumers anyway.
  const contextValue = { form, shelters, successMessages, onDonateAgain: handleDonateAgain };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] gap-20 px-5 lg:pl-20">
      {/* Content column — the footer lives in here, so it stops where the
          photo starts, matching Figma. */}
      <div className="flex w-full min-w-0 flex-col gap-10 py-10 sm:py-15 lg:max-w-[658px] lg:gap-6 lg:py-8">
        {step === "success" ? (
          <div className="flex flex-1 flex-col">
            <DonationWizardContextProvider value={contextValue}>{children}</DonationWizardContextProvider>
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-1 flex-col gap-10 lg:gap-6",
              step !== "confirm" && "lg:h-[calc(100vh-4rem)]",
            )}
          >
            <StepIndicator currentIndex={stepIndex} />
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="w-full text-3xl font-bold text-foreground outline-none sm:text-4xl lg:text-heading-lg"
            >
              {t(`heading.${step}`)}
            </h1>

            {/* Bounded to the space left over from the heading/buttons on desktop
                (min-h-0 lets a flex child actually shrink to that size instead of
                growing past it) and scrollable within itself, so a long donor
                list scrolls in place instead of growing the whole page — the
                heading, step indicator, and nav buttons never move.
                Setting overflow-y also forces overflow-x to auto (CSS can't mix
                visible with a non-visible axis), which would otherwise clip
                focused inputs' rings at the container's edges; the matching
                -mx-1/px-1 (applied at every breakpoint, since overflow-x-clip
                itself is unconditional) reclaims that space without shifting
                the content.
                Skipped on the confirm step: with many contributors its summary
                can outgrow that bounded box, and a fixed-height inner scroll
                nested inside the page's own scroll reads as two scrollbars —
                confirm just grows the page like every other step instead.
                overflow-x-hidden is unconditional (not just an lg: side-effect
                of overflow-y-auto): the incoming step's `slide-in-from-right`
                entrance animation starts translated past the right edge, which
                briefly grows this element's scrollable width and flashes a
                horizontal scrollbar on every step change without it.
                overflow-x-clip (not overflow-x-hidden) matters here: per the
                CSS overflow spec, pairing overflow-x: hidden with an explicit
                overflow-y: visible still computes the y-axis to auto, which
                reintroduces the exact inner scrollbar confirm is meant to
                skip — clip doesn't force that promotion, so visible sticks. */}
            <div
              ref={stepContentRef}
              className={cn(
                "-mx-1 overflow-x-clip px-1",
                step !== "confirm"
                  ? "lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
                  : "overflow-y-visible",
              )}
            >
              <DonationWizardContextProvider value={contextValue}>{children}</DonationWizardContextProvider>
            </div>

            {/* Figma pins the actions to the bottom of the content column. */}
            <div className="mt-auto flex items-center justify-between gap-4 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="xl"
                onClick={handleBack}
                disabled={stepIndex === 0}
              >
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                {t("back")}
              </Button>
              {step === "confirm" ? (
                <Button
                  type="button"
                  size="xl"
                  disabled={contribute.isPending}
                  onClick={(event) => {
                    void form.handleSubmit(handleSubmit, () => {
                      requestAnimationFrame(focusFirstInvalidField);
                    })(event);
                  }}
                >
                  {contribute.isPending && (
                    <Loader2 data-icon="inline-start" aria-hidden="true" className="animate-spin" />
                  )}
                  {contribute.isPending ? t("submitting") : t("donate")}
                </Button>
              ) : (
                <Button type="button" size="xl" onClick={handleNext}>
                  {t("continue")}
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        )}
        {footer}
      </div>

      {/* Fixed to the viewport height and sticky so the photo stays put
          while a long donor list scrolls the content column past it,
          instead of stretching to match that column and scrolling with it. */}
      <div className="my-5 hidden w-[360px] shrink-0 lg:sticky lg:top-5 lg:block lg:h-[calc(100vh-2.5rem)] xl:w-[602px]">
        <div className="relative h-full w-full overflow-hidden rounded-[20px]">
          <Image
            src="/images/hero-dog-beach.png"
            alt=""
            fill
            sizes="(min-width: 1280px) 602px, 360px"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </main>
  );
}
