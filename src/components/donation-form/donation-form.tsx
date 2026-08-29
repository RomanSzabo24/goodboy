"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Path } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AmountStep } from "@/components/donation-form/amount-step";
import { HelpTypeStep } from "@/components/donation-form/help-type-step";
import { PersonalDetailsStep } from "@/components/donation-form/personal-details-step";
import { StepIndicator } from "@/components/donation-form/step-indicator";
import { SuccessStep } from "@/components/donation-form/success-step";
import { useContribute } from "@/hooks/use-shelters";
import {
  DONATION_STEPS,
  useDonationFormStore,
} from "@/stores/donation-form-store";
import {
  donationFormDefaultValues,
  donationFormSchema,
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
  "help-type": ["helpType", "shelterId"],
  amount: ["amount"],
  details: ["contributors"],
};

export function DonationForm({ shelters }: { shelters: Shelter[] }) {
  const step = useDonationFormStore((state) => state.step);
  const goNext = useDonationFormStore((state) => state.goNext);
  const goBack = useDonationFormStore((state) => state.goBack);
  const reset = useDonationFormStore((state) => state.reset);
  const contribute = useContribute();

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
      toast.error("Something went wrong while submitting your donation. Please try again.");
    }
  }

  function handleDonateAgain() {
    form.reset(donationFormDefaultValues);
    setSuccessMessages([]);
    reset();
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Support the GoodBoy Foundation</CardTitle>
        {step !== "success" && <StepIndicator currentIndex={stepIndex} />}
      </CardHeader>
      <CardContent>
        {step === "help-type" && <HelpTypeStep form={form} shelters={shelters} />}
        {step === "amount" && <AmountStep form={form} />}
        {step === "details" && <PersonalDetailsStep form={form} />}
        {step === "success" && (
          <SuccessStep messages={successMessages} onDonateAgain={handleDonateAgain} />
        )}
      </CardContent>
      {step !== "success" && (
        <CardFooter className="justify-between">
          <Button type="button" variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
            Back
          </Button>
          {step === "details" ? (
            <Button
              type="button"
              disabled={contribute.isPending}
              onClick={form.handleSubmit(handleSubmit)}
            >
              {contribute.isPending ? "Submitting…" : "Donate"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Continue
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
