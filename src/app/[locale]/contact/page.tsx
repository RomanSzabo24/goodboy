import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteFooter } from "@/components/layout/site-footer";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("contactTitle"),
    description: t("contactDescription"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const cards = [
    {
      icon: "/images/icons/contact-icon-mail.png",
      title: t("emailTitle"),
      supporting: t("emailSupporting"),
      href: "mailto:info@goodboyfoundation.sk",
      value: "info@goodboyfoundation.sk",
    },
    {
      icon: "/images/icons/contact-icon-office.png",
      title: t("officeTitle"),
      supporting: t("officeSupporting"),
      value: t("addressLine"),
    },
    {
      icon: "/images/icons/contact-icon-phone.png",
      title: t("phoneTitle"),
      supporting: t("phoneSupporting"),
      href: "tel:+421911750750",
      value: "+421 911 750 750",
    },
  ];

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

        <div className="flex w-full flex-wrap items-start justify-center gap-x-8 gap-y-16 py-5">
          {cards.map((card) => (
            <div key={card.title} className="flex min-w-60 flex-1 flex-col items-center gap-5">
              <Image src={card.icon} alt="" width={48} height={48} />
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-xl font-semibold text-foreground">{card.title}</p>
                <p className="text-base text-secondary-foreground">{card.supporting}</p>
              </div>
              {card.href ? (
                <a href={card.href} className="text-base font-medium text-primary hover:underline">
                  {card.value}
                </a>
              ) : (
                <span className="text-base font-medium text-primary">{card.value}</span>
              )}
            </div>
          ))}
        </div>

        <div className="relative mx-auto aspect-[1120/376] w-full max-w-[1120px] overflow-hidden rounded-[20px]">
          <Image
            src="/images/hero-dog-sunset.png"
            alt=""
            fill
            sizes="(min-width: 1280px) 1120px, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <SiteFooter className="mt-auto" />
    </main>
  );
}
