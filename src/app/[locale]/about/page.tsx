import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteFooter } from "@/components/layout/site-footer";
import { ResultsSummary } from "@/components/results/results-summary";
import { Link } from "@/i18n/navigation";
import { getSheltersResults } from "@/services/shelters";

// Totals are "regularly updated" per the brief — match the client poll interval.
export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const results = await getSheltersResults();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-10 sm:px-20 sm:py-15">
      <div className="flex w-full flex-1 flex-col items-start gap-10 pb-10">
        <Link
          href="/"
          className="flex items-center gap-1 p-1 text-base font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          {t("back")}
        </Link>

        <h1 className="text-heading-lg font-bold text-foreground">{t("title")}</h1>
        <p className="text-base text-foreground">{t("intro")}</p>

        <ResultsSummary initialData={results} />

        <p className="text-base text-foreground">{t("closing")}</p>
      </div>

      <SiteFooter className="mt-auto" />
    </main>
  );
}
