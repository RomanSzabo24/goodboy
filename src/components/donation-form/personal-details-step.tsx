"use client";

import { useTranslations } from "next-intl";
import { Controller, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { DonationFormApi } from "@/components/donation-form/types";
import { PhoneInput } from "@/components/donation-form/phone-input";

type PersonalDetailsStepProps = {
  form: DonationFormApi;
};

export function PersonalDetailsStep({ form }: PersonalDetailsStepProps) {
  const t = useTranslations("personalDetails");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contributors",
  });

  return (
    <FieldGroup>
      {fields.map((field, index) => {
        const errors = form.formState.errors.contributors?.[index];
        return (
          <div key={field.id}>
            {index > 0 && <FieldSeparator className="mb-4" />}
            <FieldSet>
              <div className="flex items-center justify-between">
                <FieldLegend variant="label">
                  {fields.length > 1 ? t("donorNumber", { number: index + 1 }) : t("yourDetails")}
                </FieldLegend>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("removeDonorAriaLabel", { number: index + 1 })}
                    onClick={() => remove(index)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors?.name}>
                  <FieldLabel htmlFor={`contributors.${index}.name`}>{t("nameLabel")}</FieldLabel>
                  <Input
                    id={`contributors.${index}.name`}
                    autoComplete="given-name"
                    aria-invalid={!!errors?.name}
                    {...form.register(`contributors.${index}.name`)}
                  />
                  <FieldError errors={[errors?.name]} />
                </Field>

                <Field data-invalid={!!errors?.surname}>
                  <FieldLabel htmlFor={`contributors.${index}.surname`}>
                    {t("surnameLabel")}
                  </FieldLabel>
                  <Input
                    id={`contributors.${index}.surname`}
                    autoComplete="family-name"
                    aria-invalid={!!errors?.surname}
                    {...form.register(`contributors.${index}.surname`)}
                  />
                  <FieldError errors={[errors?.surname]} />
                </Field>
              </div>

              <Field data-invalid={!!errors?.email}>
                <FieldLabel htmlFor={`contributors.${index}.email`}>{t("emailLabel")}</FieldLabel>
                <Input
                  id={`contributors.${index}.email`}
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors?.email}
                  {...form.register(`contributors.${index}.email`)}
                />
                <FieldError errors={[errors?.email]} />
              </Field>

              <Field data-invalid={!!errors?.phone}>
                <FieldLabel htmlFor={`contributors.${index}.phone`}>{t("phoneLabel")}</FieldLabel>
                <Controller
                  control={form.control}
                  name={`contributors.${index}.phone`}
                  render={({ field: phoneField }) => (
                    <PhoneInput
                      id={`contributors.${index}.phone`}
                      value={phoneField.value}
                      onChange={phoneField.onChange}
                      onBlur={phoneField.onBlur}
                      aria-invalid={!!errors?.phone}
                    />
                  )}
                />
                <FieldError errors={[errors?.phone]} />
              </Field>
            </FieldSet>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ name: "", surname: "", email: "", phone: "" })}
      >
        <Plus /> {t("addDonor")}
      </Button>
    </FieldGroup>
  );
}
