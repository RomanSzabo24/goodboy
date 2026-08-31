"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { useSheltersResults } from "@/hooks/use-shelters";
import type { ResultsResponse } from "@/services/shelters";

/**
 * Figma shows these totals only on the "O projekte" page, as a bordered pair of
 * large metrics. Still a client component so the numbers keep polling live.
 */
export function ResultsSummary({ initialData }: { initialData: ResultsResponse }) {
  const t = useTranslations("results");
  const format = useFormatter();
  const { data, isError } = useSheltersResults(undefined);
  const results = data ?? initialData;

  const metrics = [
    {
      value: format.number(results.contribution ?? 0, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
      label: t("totalRaised"),
    },
    {
      value: format.number(results.contributors),
      label: t("donorCount"),
    },
  ];

  return (
    <div className="flex w-full flex-col items-center gap-4 border-y py-16">
      <div className="flex w-full flex-wrap items-start justify-center gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex min-w-60 flex-1 flex-col items-center gap-3">
            {/* Keying on the formatted value replays this fade whenever a
                background poll brings in a new total, drawing the eye to
                the update without any layout shift. */}
            <p
              key={metric.value}
              className="text-center text-heading-xl font-semibold text-primary animate-in fade-in-0 duration-700"
            >
              {metric.value}
            </p>
            <p className="text-center text-lg font-medium text-foreground">{metric.label}</p>
          </div>
        ))}
      </div>
      {isError && (
        <p role="alert" className="flex items-center gap-2 text-sm text-muted-foreground">
          <TriangleAlertIcon className="size-4 shrink-0" aria-hidden="true" />
          {t("refreshError")}
        </p>
      )}
    </div>
  );
}
