import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-10 sm:py-16">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <p className="text-muted-foreground">{t("intro")}</p>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-3">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{t("addressLine")}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <a href="mailto:info@goodboyfoundation.sk" className="hover:underline">
                info@goodboyfoundation.sk
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <a href="tel:+421900000000" className="hover:underline">
                +421 900 000 000
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
