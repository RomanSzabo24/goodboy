import Image from "next/image";
import { setRequestLocale } from "next-intl/server";

import { DonationForm } from "@/components/donation-form/donation-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { getShelters } from "@/services/shelters";

// The shelter list changes rarely, but shouldn't be frozen at build time.
export const revalidate = 3600;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sheltersResponse = await getShelters();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] gap-20 px-5 lg:pl-20">
      {/* Content column — the footer lives in here, so it stops where the
          photo starts, matching Figma. */}
      <div className="flex w-full min-w-0 flex-col gap-10 py-10 sm:py-15 lg:max-w-[658px] lg:gap-6 lg:py-8">
        <DonationForm shelters={sheltersResponse.shelters} />
        <SiteFooter />
      </div>

      <div className="relative my-5 hidden w-[602px] shrink-0 overflow-hidden rounded-[20px] lg:block">
        <Image
          src="/images/hero-dog-beach.png"
          alt=""
          fill
          sizes="602px"
          className="object-cover"
          priority
        />
      </div>
    </main>
  );
}
