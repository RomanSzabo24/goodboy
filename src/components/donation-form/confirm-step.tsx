"use client";

import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel, FieldSeparator } from "@/components/ui/field";
import type { DonationFormApi } from "@/components/donation-form/types";
import { cn } from "@/lib/utils";
import type { Shelter } from "@/services/shelters";

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 text-base">
      <span className="text-secondary-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}

type ConfirmStepProps = {
  form: DonationFormApi;
  shelters: Shelter[];
  className?: string;
};

export function ConfirmStep({ form, shelters, className }: ConfirmStepProps) {
  const t = useTranslations("confirm");
  const tPersonal = useTranslations("personalDetails");
  const values = form.getValues();
  const shelterName = shelters.find((shelter) => shelter.id === values.shelterId)?.name;

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <h3 className="text-base font-semibold text-foreground">{t("summaryTitle")}</h3>

      <SummaryRow
        label={t("helpTypeLabel")}
        value={values.helpType === "GIFT_SHELTER" ? t("helpTypeShelterValue") : t("helpTypeFoundationValue")}
      />
      {/* Shown whenever a shelter is actually chosen, not just for
          GIFT_SHELTER — the shelter picker on step 1 stays available (and
          optional) for a general donation too, so a donor can earmark a
          preferred shelter without switching help types, and Figma's Step 3
          shows the row in exactly that combination. */}
      {shelterName && <SummaryRow label={t("shelterLabel")} value={shelterName} />}
      <SummaryRow label={t("amountLabel")} value={`${values.amount} €`} />

      <FieldSeparator />

      {values.contributors.map((contributor, index) => (
        <div key={index} className="flex flex-col gap-4">
          {values.contributors.length > 1 && (
            <h4 className="text-sm font-medium text-foreground">
              {tPersonal("donorNumber", { number: index + 1 })}
            </h4>
          )}
          <SummaryRow
            label={t("nameLabel")}
            value={[contributor.name, contributor.surname].filter(Boolean).join(" ")}
          />
          <SummaryRow label={t("emailLabel")} value={contributor.email} />
          <SummaryRow label={t("phoneLabel")} value={contributor.phone} />
          {index < values.contributors.length - 1 && <FieldSeparator />}
        </div>
      ))}

      <FieldSeparator />

      <Field data-invalid={!!form.formState.errors.consent}>
        <FieldLabel htmlFor="consent" className="items-start">
          <Controller
            control={form.control}
            name="consent"
            render={({ field: consentField }) => (
              <Checkbox
                id="consent"
                checked={consentField.value}
                onCheckedChange={(checked) => consentField.onChange(checked === true)}
                aria-invalid={!!form.formState.errors.consent}
                aria-describedby={form.formState.errors.consent ? "consent-error" : undefined}
              />
            )}
          />
          <span>{tPersonal("consentLabel")}</span>
        </FieldLabel>
        <FieldError id="consent-error" errors={[form.formState.errors.consent]} />
      </Field>
    </div>
  );
}
