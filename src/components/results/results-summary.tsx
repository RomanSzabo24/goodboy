"use client";

import { HeartHandshake, Users } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import { useSheltersResults } from "@/hooks/use-shelters";
import type { ResultsResponse } from "@/services/shelters";

export function ResultsSummary({ initialData }: { initialData: ResultsResponse }) {
  const t = useTranslations("results");
  const format = useFormatter();
  const { data } = useSheltersResults(undefined);
  const results = data ?? initialData;

  return (
    <Card className="w-full max-w-xl">
      <CardContent className="flex items-center justify-around gap-4 py-2 text-center">
        <div className="flex flex-col items-center gap-1">
          <HeartHandshake className="size-5 text-primary" aria-hidden="true" />
          <span className="text-xl font-semibold">
            {format.number(results.contribution ?? 0, {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            })}
          </span>
          <span className="text-xs text-muted-foreground">{t("raised")}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Users className="size-5 text-primary" aria-hidden="true" />
          <span className="text-xl font-semibold">{results.contributors}</span>
          <span className="text-xs text-muted-foreground">{t("donors")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
