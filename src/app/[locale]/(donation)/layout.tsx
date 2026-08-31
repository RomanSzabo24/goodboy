import { setRequestLocale } from "next-intl/server";

import { DonationWizardProvider } from "@/components/donation-form/donation-wizard-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { routing } from "@/i18n/routing";
import { getShelters } from "@/services/shelters";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// The shelter list changes rarely, but shouldn't be frozen at build time.
export const revalidate = 3600;

// Groups every wizard step ("/" plus "/donate/*") under one shared shell: the
// route group (no URL segment of its own) lets each step be a real, separate
// route with its own `generateMetadata` while still sharing one fetched
// shelter list and one `useForm()` instance across navigation between them —
// see DonationWizardProvider.
export default async function DonationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { shelters } = await getShelters();

  return (
    <DonationWizardProvider shelters={shelters} footer={<SiteFooter />}>
      {children}
    </DonationWizardProvider>
  );
}
