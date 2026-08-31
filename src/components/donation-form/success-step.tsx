"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { ContributeMessage } from "@/services/shelters";

type SuccessStepProps = {
  messages: ContributeMessage[];
  onDonateAgain: () => void;
};

export function SuccessStep({ messages, onDonateAgain }: SuccessStepProps) {
  const t = useTranslations("success");
  const headingRef = useRef<HTMLHeadingElement>(null);

  // This step mounts fresh when the flow reaches it, so a mount-only focus
  // move is enough to announce the transition to keyboard/screen-reader users.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
      <CheckCircle2
        className="size-12 text-primary animate-in zoom-in-50 duration-700"
        aria-hidden="true"
      />
      <h1 ref={headingRef} tabIndex={-1} className="text-heading-lg font-bold text-foreground outline-none">
        {t("heading")}
      </h1>
      <ul className="flex flex-col gap-1 text-base text-secondary-foreground">
        {messages.map((message, index) => (
          <li key={index}>{message.message}</li>
        ))}
      </ul>
      <Button type="button" size="xl" onClick={onDonateAgain}>
        {t("donateAgain")}
      </Button>
    </div>
  );
}
