import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ConfirmPageContent } from "@/components/donation-form/confirm-page-content";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.donationSteps.confirm" });
  return { title: t("title"), description: t("description") };
}

export default async function ConfirmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ConfirmPageContent />;
}
