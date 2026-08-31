import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Only local, trusted SVGs (country flags) are served through next/image.
    dangerouslyAllowSVG: true,
  },
};

export default withNextIntl(nextConfig);
