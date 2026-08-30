"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
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

  async function handleNext() {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (valid) goNext();
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
    <div className="flex flex-1 flex-col gap-10">
      <StepIndicator currentIndex={stepIndex} />
      <h1 className="w-full text-heading-lg font-bold text-foreground">{t(`heading.${step}`)}</h1>

      {step === "shelter" && <ShelterStep form={form} shelters={shelters} />}
      {step === "details" && <PersonalDetailsStep form={form} />}
      {step === "confirm" && <ConfirmStep form={form} shelters={shelters} />}

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
            onClick={form.handleSubmit(handleSubmit)}
          >
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
