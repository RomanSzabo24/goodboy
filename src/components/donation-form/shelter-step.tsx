"use client";

import { Euro } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { DonationFormApi } from "@/components/donation-form/types";
import type { Shelter } from "@/services/shelters";

const PRESET_AMOUNTS = [5, 10, 20, 30, 50, 100] as const;

type ShelterStepProps = {
  form: DonationFormApi;
  shelters: Shelter[];
  className?: string;
};

export function ShelterStep({ form, shelters, className }: ShelterStepProps) {
  const t = useTranslations("helpType");
  const tAmount = useTranslations("amount");
  const helpType = form.watch("helpType");
  const amount = form.watch("amount");
  const presetValue = PRESET_AMOUNTS.includes(amount as (typeof PRESET_AMOUNTS)[number])
    ? String(amount)
    : "";

  return (
    <FieldSet className={cn("gap-10 lg:gap-6", className)}>
      <Controller
        control={form.control}
        name="helpType"
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              if (value === "GIFT_FOUNDATION") {
                form.setValue("shelterId", undefined);
                form.clearErrors("shelterId");
              }
            }}
            className="flex w-full gap-1 rounded-xl border border-border bg-background p-1"
            aria-label={t("legend")}
          >
            <FieldLabel
              htmlFor="help-type-shelter"
              className="flex-1 justify-center rounded-lg border-0 px-2 py-4 text-center text-sm transition-colors duration-200 has-data-checked:border-0 has-data-checked:bg-primary has-data-checked:text-primary-foreground not-has-data-checked:hover:bg-muted"
            >
              <span className="sr-only">
                <RadioGroupItem value="GIFT_SHELTER" id="help-type-shelter" />
              </span>
              {t("shelter")}
            </FieldLabel>
            <FieldLabel
              htmlFor="help-type-foundation"
              className="flex-1 justify-center rounded-lg border-0 px-2 py-4 text-center text-sm transition-colors duration-200 has-data-checked:border-0 has-data-checked:bg-primary has-data-checked:text-primary-foreground not-has-data-checked:hover:bg-muted"
            >
              <span className="sr-only">
                <RadioGroupItem value="GIFT_FOUNDATION" id="help-type-foundation" />
              </span>
              {t("general")}
            </FieldLabel>
          </RadioGroup>
        )}
      />
      <div className="flex flex-col gap-4">
        <FieldLegend variant="legend" className="mb-0 font-semibold">
          {t("sectionTitle")}
        </FieldLegend>
        <Field data-invalid={!!form.formState.errors.shelterId}>
          <FieldLabel htmlFor="shelter-id">
            {t("shelterLabel")}{" "}
            {helpType === "GIFT_FOUNDATION" && (
              <span className="font-normal text-muted-foreground">{t("shelterOptional")}</span>
            )}
          </FieldLabel>
          <Controller
            control={form.control}
            name="shelterId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : undefined}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger
                  id="shelter-id"
                  className="w-full"
                  aria-invalid={!!form.formState.errors.shelterId}
                  aria-describedby={form.formState.errors.shelterId ? "shelter-id-error" : undefined}
                >
                  <SelectValue placeholder={t("shelterPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {shelters.map((shelter) => (
                    <SelectItem key={shelter.id} value={String(shelter.id)}>
                      {shelter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError id="shelter-id-error" errors={[form.formState.errors.shelterId]} />
        </Field>
      </div>

      <Field data-invalid={!!form.formState.errors.amount}>
        <FieldLabel htmlFor="amount" className="text-base font-semibold text-foreground">
          {tAmount("heading")}
        </FieldLabel>
        <FieldDescription>{tAmount("description")}</FieldDescription>

        <div className="flex w-full flex-col items-center gap-10 lg:gap-6">
          <div className="flex items-center gap-2 border-b-2 border-primary px-8 py-2.5">
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              aria-invalid={!!form.formState.errors.amount}
              aria-describedby={form.formState.errors.amount ? "amount-error" : undefined}
              className="w-32 bg-transparent text-center text-heading-xl text-foreground outline-none placeholder:text-muted-foreground sm:w-40"
              placeholder="0"
              {...form.register("amount", { valueAsNumber: true })}
            />
            <Euro className="size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
          </div>

          <ToggleGroup
            type="single"
            value={presetValue}
            onValueChange={(value) => {
              if (value) form.setValue("amount", Number(value), { shouldValidate: true });
            }}
            className="w-full flex-wrap gap-4"
            aria-label={tAmount("presetAriaLabel")}
          >
            {PRESET_AMOUNTS.map((preset) => (
              <ToggleGroupItem
                key={preset}
                value={String(preset)}
                aria-label={tAmount("presetOptionAriaLabel", { amount: preset })}
                className={cn(
                  "h-auto min-w-24 flex-1 rounded-lg bg-muted px-6 py-3 text-base font-medium text-secondary-foreground hover:bg-muted",
                  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                )}
              >
                {preset} €
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <FieldError id="amount-error" errors={[form.formState.errors.amount]} />
      </Field>
    </FieldSet>
  );
}
