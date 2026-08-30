"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export function StepIndicator({ currentIndex }: { currentIndex: number }) {
  const t = useTranslations("steps");
  const stepLabels = [t("helpType"), t("amount"), t("details")];

  return (
    <ol className="flex w-full items-center gap-2" aria-label={t("progressLabel")}>
      {stepLabels.map((label, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ring-1 ring-inset ring-border",
                isCurrent && "bg-primary text-primary-foreground ring-primary",
                isComplete && "bg-primary/15 text-primary ring-primary/40",
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm text-muted-foreground sm:inline",
                isCurrent && "font-medium text-foreground",
              )}
            >
              {label}
            </span>
            {index < stepLabels.length - 1 && (
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
