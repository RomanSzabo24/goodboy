"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useFieldArray, type Path } from "react-hook-form";
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
import type { DonationFormInput } from "@/lib/validations/donation";

type PersonalDetailsStepProps = {
  form: DonationFormApi;
};

/** The four leaf fields react-hook-form needs validated per contributor row. */
function contributorFieldPaths(index: number): Path<DonationFormInput>[] {
  return [
    `contributors.${index}.name`,
    `contributors.${index}.surname`,
    `contributors.${index}.email`,
    `contributors.${index}.phone`,
  ] as Path<DonationFormInput>[];
}

export function PersonalDetailsStep({ form }: PersonalDetailsStepProps) {
  const t = useTranslations("personalDetails");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contributors",
  });
  // Rows that are correctly filled in and shown as a collapsed summary
  // instead of the full editable form. Keyed by useFieldArray's stable
  // field.id so it survives rows being added/removed at other indices.
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

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

  // Collapse every already-valid donor row before adding a new one, so the
  // form doesn't grow into a wall of repeated fields. `form.formState.errors`
  // read from this closure reflects the render that created it, not the
  // trigger() call below, so validity comes from trigger()'s own resolved
  // booleans instead.
  async function handleAddDonor() {
    const validity = await Promise.all(
      fields.map((_, index) => form.trigger(contributorFieldPaths(index))),
    );
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      fields.forEach((field, index) => {
        if (validity[index]) next.add(field.id);
      });
      return next;
    });
    append({ name: "", surname: "", email: "", phone: "" });
  }

  return (
    <FieldGroup>
      {fields.map((field, index) => {
        const errors = form.formState.errors.contributors?.[index];
        const title = fields.length > 1 ? t("donorNumber", { number: index + 1 }) : t("yourDetails");

        if (collapsedIds.has(field.id)) {
          const values = form.getValues(`contributors.${index}`);
          return (
            <div key={field.id}>
              {index > 0 && <FieldSeparator className="mb-4" />}
              <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
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
            <FieldSet>
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

      <Button type="button" variant="outline" size="sm" onClick={handleAddDonor}>
        <Plus /> {t("addDonor")}
      </Button>
    </FieldGroup>
  );
}
