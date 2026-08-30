"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm, type Path } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmStep } from "@/components/donation-form/confirm-step";
import { PersonalDetailsStep } from "@/components/donation-form/personal-details-step";
import { ShelterStep } from "@/components/donation-form/shelter-step";
import { StepIndicator } from "@/components/donation-form/step-indicator";
import { SuccessStep } from "@/components/donation-form/success-step";
import { useContribute } from "@/hooks/use-shelters";
import {
  DONATION_STEPS,
  useDonationFormStore,
} from "@/stores/donation-form-store";
import {
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

// Each step is a different component behind its own `step === "..."` check,
// so switching steps always unmounts the old one and mounts the new one —
// this entrance animation replays on every genuine mount for free.
const STEP_TRANSITION_CLASS = "animate-in fade-in-0 slide-in-from-right-2 duration-300";

export function DonationForm({ shelters }: { shelters: Shelter[] }) {
  const t = useTranslations("form");
  const tValidation = useTranslations("validation");
  const step = useDonationFormStore((state) => state.step);
  const goNext = useDonationFormStore((state) => state.goNext);
  const goBack = useDonationFormStore((state) => state.goBack);
  const reset = useDonationFormStore((state) => state.reset);
  const contribute = useContribute();

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

  const stepIndex = DONATION_STEPS.indexOf(step);
  const [successMessages, setSuccessMessages] = useState<ContributeMessage[]>([]);

  // Every control that can be invalid also gets `aria-invalid`, so after a
  // failed validation attempt the first offending control can always be
  // found generically instead of maintaining a per-step ref map.
  const stepContentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  function focusFirstInvalidField() {
    stepContentRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }

  // Move focus to the new step's heading on every step change so keyboard
  // and screen-reader users get a clear signal the view advanced, without
  // stealing focus from the URL bar on the initial page load.
  // `preventScroll` + an explicit `scrollIntoView()` (rather than letting
  // `focus()` snap the page itself) means the scroll follows the page's
  // `scroll-behavior: smooth` from globals.css instead of jumping instantly
  // — most noticeable on mobile, where "Pokračovať" sits far below the
  // heading it needs to bring into view.
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
      goNext();
      return;
    }
    requestAnimationFrame(focusFirstInvalidField);
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
      goNext();
    } catch {
      toast.error(t("submitError"));
    }
  }

  function handleDonateAgain() {
    form.reset(donationFormDefaultValues);
    setSuccessMessages([]);
    reset();
  }

  if (step === "success") {
    return (
      <div className="flex flex-1 flex-col">
        <SuccessStep messages={successMessages} onDonateAgain={handleDonateAgain} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-10 lg:h-[calc(100vh-4rem)] lg:gap-6">
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
          -mx-1/px-1 reclaims that space without shifting the content. */}
      <div
        ref={stepContentRef}
        className="lg:-mx-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-1"
      >
        {step === "shelter" && (
          <ShelterStep form={form} shelters={shelters} className={STEP_TRANSITION_CLASS} />
        )}
        {step === "details" && (
          <PersonalDetailsStep form={form} className={STEP_TRANSITION_CLASS} />
        )}
        {step === "confirm" && (
          <ConfirmStep form={form} shelters={shelters} className={STEP_TRANSITION_CLASS} />
        )}
      </div>

      {/* Figma pins the actions to the bottom of the content column. */}
      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="xl"
          onClick={goBack}
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
  );
}
