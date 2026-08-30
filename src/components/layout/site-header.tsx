import { PawPrint } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Link } from "@/i18n/navigation";

export async function SiteHeader() {
  const t = await getTranslations("nav");

  return (
    <header className="flex items-center justify-between border-b px-4 py-3 sm:px-8">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <PawPrint className="size-5 text-primary" aria-hidden="true" />
        GoodBoy Foundation
      </Link>
      <div className="flex items-center gap-4">
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-4 text-sm">
            <li>
              <Link href="/" className="hover:underline">
                {t("donate")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                {t("contact")}
              </Link>
            </li>
          </ul>
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
