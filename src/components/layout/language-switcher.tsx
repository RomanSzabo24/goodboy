"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<(typeof routing.locales)[number], string> = {
  sk: "Slovenčina",
  en: "English",
};

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={locale}
      onValueChange={(nextLocale) => {
        startTransition(() => {
          router.replace(pathname, { locale: nextLocale });
        });
      }}
    >
      <SelectTrigger className="w-[110px]" aria-label={t("language")} disabled={isPending}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((code) => (
          <SelectItem key={code} value={code}>
            {LOCALE_LABELS[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
