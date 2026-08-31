import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ShelterPageContent } from "@/components/donation-form/shelter-page-content";
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
  const t = await getTranslations({ locale, namespace: "metadata.donationSteps.shelter" });
  return { title: t("title"), description: t("description") };
}

export default async function ShelterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ShelterPageContent />;
}
