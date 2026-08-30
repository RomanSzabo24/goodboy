"use client";

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
import type { DonationFormApi } from "@/components/donation-form/types";
import type { Shelter } from "@/services/shelters";

type HelpTypeStepProps = {
  form: DonationFormApi;
  shelters: Shelter[];
};

export function HelpTypeStep({ form, shelters }: HelpTypeStepProps) {
  const t = useTranslations("helpType");
  const helpType = form.watch("helpType");

  return (
    <FieldSet>
      <FieldLegend>{t("legend")}</FieldLegend>
      <FieldDescription>{t("description")}</FieldDescription>
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
            className="grid gap-3 sm:grid-cols-2"
          >
            <FieldLabel htmlFor="help-type-foundation">
              <Field orientation="horizontal">
                <RadioGroupItem value="GIFT_FOUNDATION" id="help-type-foundation" />
                <span>{t("general")}</span>
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="help-type-shelter">
              <Field orientation="horizontal">
                <RadioGroupItem value="GIFT_SHELTER" id="help-type-shelter" />
                <span>{t("shelter")}</span>
              </Field>
            </FieldLabel>
          </RadioGroup>
        )}
      />

      {helpType === "GIFT_SHELTER" && (
        <Field data-invalid={!!form.formState.errors.shelterId}>
          <FieldLabel htmlFor="shelter-id">{t("shelterLabel")}</FieldLabel>
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
          <FieldError errors={[form.formState.errors.shelterId]} />
        </Field>
      )}
    </FieldSet>
  );
}
