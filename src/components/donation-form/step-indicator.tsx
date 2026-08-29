import { cn } from "@/lib/utils";

const STEP_LABELS = ["Help type", "Amount", "Your details"] as const;

export function StepIndicator({ currentIndex }: { currentIndex: number }) {
  return (
    <ol className="flex w-full items-center gap-2" aria-label="Donation form progress">
      {STEP_LABELS.map((label, index) => {
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
            {index < STEP_LABELS.length - 1 && (
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
