"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export function StepIndicator({ currentIndex }: { currentIndex: number }) {
  const t = useTranslations("steps");
  const stepLabels = [t("shelter"), t("details"), t("confirm")];

  return (
    <ol className="@container flex w-full items-center gap-4" aria-label={t("progressLabel")}>
      {stepLabels.map((label, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li
            key={label}
            className="flex min-w-0 items-center gap-2 not-last:flex-1 last:shrink-0"
          >
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border text-base transition-colors duration-300",
                isCurrent && "border-primary bg-primary text-primary-foreground",
                isComplete && "border-primary text-primary",
                !isCurrent && !isComplete && "border-muted-foreground/30 text-muted-foreground/30",
              )}
            >
              {isComplete ? (
                <Check className="size-4 animate-in zoom-in-50 duration-300" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                "hidden shrink-0 text-base whitespace-nowrap text-muted-foreground/30 transition-colors duration-300 @xl:inline",
                (isCurrent || isComplete) && "text-foreground",
              )}
            >
              {label}
            </span>
            {index < stepLabels.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "h-px min-w-6 flex-1 bg-border transition-colors duration-300",
                  isComplete && "bg-primary",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
