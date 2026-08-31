"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useFieldArray } from "react-hook-form";
import { Pencil, Plus, Trash2 } from "lucide-react";

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
import { contributorSchema } from "@/lib/validations/donation";

type PersonalDetailsStepProps = {
  form: DonationFormApi;
  className?: string;
};

export function PersonalDetailsStep({ form, className }: PersonalDetailsStepProps) {
  const t = useTranslations("personalDetails");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contributors",
  });
  // Live values (not formState.errors, which only updates on blur/submit)
  // so the "add donor" button reacts as soon as a row becomes valid.
  const contributors = form.watch("contributors");
  // Rows that are correctly filled in and shown as a collapsed summary
  // instead of the full editable form. Keyed by useFieldArray's stable
  // field.id so it survives rows being added/removed at other indices.
  // This step unmounts on every step change, so on mount (e.g. navigating
  // back from Confirm) any row that's already valid starts collapsed
  // instead of re-expanding the whole form.
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () =>
      new Set(
        fields
          .filter((field, index) => contributorSchema.safeParse(contributors[index]).success)
          .map((field) => field.id),
      ),
  );

  // Every row not already collapsed must be correctly filled in before
  // another donor can be added — otherwise the form keeps growing with
  // half-finished rows instead of one clear one at a time.
  const canAddDonor = fields.every(
    (field, index) =>
      collapsedIds.has(field.id) || contributorSchema.safeParse(contributors[index]).success,
  );

  function expandRow(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function removeRow(index: number, id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    remove(index);
  }

  function handleAddDonor() {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      fields.forEach((field) => next.add(field.id));
      return next;
    });
    append({ name: "", surname: "", email: "", phone: "" });
  }

  return (
    <FieldGroup className={className}>
      {fields.map((field, index) => {
        const errors = form.formState.errors.contributors?.[index];
        const title = fields.length > 1 ? t("donorNumber", { number: index + 1 }) : t("yourDetails");

        if (collapsedIds.has(field.id)) {
          const values = form.getValues(`contributors.${index}`);
          return (
            <div key={field.id}>
              {index > 0 && <FieldSeparator className="mb-4" />}
              <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4 animate-in fade-in-0 slide-in-from-top-1 duration-500">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{title}</span>
                  <span className="text-sm text-secondary-foreground">
                    {[values.name, values.surname].filter(Boolean).join(" ")}
                  </span>
                  <span className="text-sm text-secondary-foreground">{values.email}</span>
                  <span className="text-sm text-secondary-foreground">{values.phone}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => expandRow(field.id)}>
                    <Pencil /> {t("edit")}
                  </Button>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("removeDonorAriaLabel", { number: index + 1 })}
                      onClick={() => removeRow(index, field.id)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={field.id}>
            {index > 0 && <FieldSeparator className="mb-4" />}
            <FieldSet className="animate-in fade-in-0 slide-in-from-top-1 duration-500">
              <div className="flex items-center justify-between">
                <FieldLegend variant="label">{title}</FieldLegend>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("removeDonorAriaLabel", { number: index + 1 })}
                    onClick={() => removeRow(index, field.id)}
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
                    placeholder={t("namePlaceholder")}
                    aria-invalid={!!errors?.name}
                    aria-describedby={errors?.name ? `contributors.${index}.name-error` : undefined}
                    {...form.register(`contributors.${index}.name`)}
                  />
                  <FieldError id={`contributors.${index}.name-error`} errors={[errors?.name]} />
                </Field>

                <Field data-invalid={!!errors?.surname}>
                  <FieldLabel htmlFor={`contributors.${index}.surname`}>
                    {t("surnameLabel")}
                  </FieldLabel>
                  <Input
                    id={`contributors.${index}.surname`}
                    autoComplete="family-name"
                    placeholder={t("surnamePlaceholder")}
                    aria-invalid={!!errors?.surname}
                    aria-describedby={errors?.surname ? `contributors.${index}.surname-error` : undefined}
                    {...form.register(`contributors.${index}.surname`)}
                  />
                  <FieldError id={`contributors.${index}.surname-error`} errors={[errors?.surname]} />
                </Field>
              </div>

              <Field data-invalid={!!errors?.email}>
                <FieldLabel htmlFor={`contributors.${index}.email`}>{t("emailLabel")}</FieldLabel>
                <Input
                  id={`contributors.${index}.email`}
                  type="email"
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  aria-invalid={!!errors?.email}
                  aria-describedby={errors?.email ? `contributors.${index}.email-error` : undefined}
                  {...form.register(`contributors.${index}.email`)}
                />
                <FieldError id={`contributors.${index}.email-error`} errors={[errors?.email]} />
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
                      aria-describedby={errors?.phone ? `contributors.${index}.phone-error` : undefined}
                    />
                  )}
                />
                <FieldError id={`contributors.${index}.phone-error`} errors={[errors?.phone]} />
              </Field>
            </FieldSet>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddDonor}
        disabled={!canAddDonor}
      >
        <Plus /> {t("addDonor")}
      </Button>
    </FieldGroup>
  );
}
