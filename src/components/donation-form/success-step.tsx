"use client";

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

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <CheckCircle2 className="size-12 text-primary" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{t("heading")}</h2>
      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {messages.map((message, index) => (
          <li key={index}>{message.message}</li>
        ))}
      </ul>
      <Button type="button" onClick={onDonateAgain}>
        {t("donateAgain")}
      </Button>
    </div>
  );
}
