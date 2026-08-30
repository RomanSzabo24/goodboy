"use client";

import { useTranslations } from "next-intl";

type ErrorSummaryProps = {
  messages: string[];
};

export function ErrorSummary({ messages }: ErrorSummaryProps) {
  const t = useTranslations("form");

  if (messages.length === 0) return null;

  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive"
    >
      <p className="text-sm font-semibold">{t("errorSummaryTitle", { count: messages.length })}</p>
      <ul className="ml-4 flex list-disc flex-col gap-1 text-sm">
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
