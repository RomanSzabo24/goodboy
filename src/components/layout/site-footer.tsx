import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const SOCIALS = [
  { icon: "/icons/social-facebook.svg", label: "Facebook", href: "https://www.facebook.com/" },
  { icon: "/icons/social-instagram.svg", label: "Instagram", href: "https://www.instagram.com/" },
] as const;

/**
 * Figma places this inside the page's content column (so on the donation form
 * it stops where the side photo starts), never spanning the full viewport —
 * hence it takes a className instead of positioning itself.
 */
export async function SiteFooter({ className }: { className?: string }) {
  const t = await getTranslations("nav");

  return (
    <footer
      className={cn(
        "flex w-full flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t pt-6",
        className,
      )}
    >
      <Link href="/" className="flex items-center">
        <Image src="/images/logo.png" alt="GoodBoy Foundation" width={124} height={32} />
      </Link>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <ul className="flex items-center gap-4">
          {SOCIALS.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={social.label}
                className="inline-flex transition-opacity hover:opacity-70"
              >
                <Image src={social.icon} alt="" width={16} height={16} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-8 text-base text-secondary-foreground">
            <li>
              <Link href="/contact" className="transition-colors hover:text-foreground hover:underline">
                {t("contact")}
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition-colors hover:text-foreground hover:underline">
                {t("about")}
              </Link>
            </li>
          </ul>
        </nav>
        <LanguageSwitcher />
      </div>
    </footer>
  );
}
