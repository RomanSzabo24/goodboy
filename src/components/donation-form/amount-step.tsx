"use client";

import { Field, FieldDescription, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DonationFormApi } from "@/components/donation-form/types";

const PRESET_AMOUNTS = [5, 10, 25, 50] as const;

type AmountStepProps = {
  form: DonationFormApi;
};

export function AmountStep({ form }: AmountStepProps) {
  const amount = form.watch("amount");
  const presetValue = PRESET_AMOUNTS.includes(amount as (typeof PRESET_AMOUNTS)[number])
    ? String(amount)
    : undefined;

  return (
    <FieldSet>
      <FieldDescription>Choose a preset amount or enter your own.</FieldDescription>
      <ToggleGroup
        type="single"
        variant="outline"
        value={presetValue}
        onValueChange={(value) => {
          if (value) form.setValue("amount", Number(value), { shouldValidate: true });
        }}
        className="flex-wrap"
        aria-label="Preset donation amount"
      >
        {PRESET_AMOUNTS.map((preset) => (
          <ToggleGroupItem key={preset} value={String(preset)} aria-label={`${preset} euros`}>
            {preset} €
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Field data-invalid={!!form.formState.errors.amount}>
        <FieldLabel htmlFor="amount">Custom amount (EUR)</FieldLabel>
        <Input
          id="amount"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.5"
          aria-invalid={!!form.formState.errors.amount}
          placeholder="Enter amount"
          {...form.register("amount", { valueAsNumber: true })}
        />
        <FieldError errors={[form.formState.errors.amount]} />
      </Field>
    </FieldSet>
  );
}
