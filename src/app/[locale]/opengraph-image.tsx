import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const alt = "GoodBoy Foundation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Without this, Next treats the route as dynamic (generated per-request)
// instead of prerendering + caching one image per locale at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Fonts and the logo don't depend on request data, so they're read once at
// module scope instead of per-request. The woff files are pre-subsetted to
// Latin + Slovak/Czech diacritics (see scripts note below) to stay well
// under ImageResponse's 500KB total bundle budget.
const assetsDir = join(process.cwd(), "src/app/[locale]/opengraph-assets");
const [interBold, interMedium, logoBuffer] = await Promise.all([
  readFile(join(assetsDir, "inter-bold.woff")),
  readFile(join(assetsDir, "inter-medium.woff")),
  readFile(join(process.cwd(), "public/images/logo.png")),
]);
const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -140,
            width: 480,
            height: 480,
            borderRadius: "50%",
            backgroundColor: "#e0e7ff",
          }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={186} height={48} alt="" />

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: 56,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#111827",
              maxWidth: 980,
            }}
          >
            {t("homeTitle")}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 30,
              lineHeight: 1.4,
              color: "#6b7280",
              maxWidth: 900,
            }}
          >
            {t("homeDescription")}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
        { name: "Inter", data: interMedium, weight: 500, style: "normal" },
      ],
    },
  );
}
