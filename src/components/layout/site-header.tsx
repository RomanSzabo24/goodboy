import Link from "next/link";
import { PawPrint } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b px-4 py-3 sm:px-8">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <PawPrint className="size-5 text-primary" aria-hidden="true" />
        GoodBoy Foundation
      </Link>
      <nav aria-label="Main navigation">
        <ul className="flex items-center gap-4 text-sm">
          <li>
            <Link href="/" className="hover:underline">
              Donate
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
