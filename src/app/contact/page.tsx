import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact — GoodBoy Foundation",
  description: "Contact details for the GoodBoy Foundation.",
};

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-10 sm:py-16">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-xl">Contact us</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <p className="text-muted-foreground">
            Have a question about donating or partnering with a shelter? Reach out to the
            GoodBoy Foundation team.
          </p>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-3">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>Búdková 1, 811 04 Bratislava, Slovakia</span>
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
