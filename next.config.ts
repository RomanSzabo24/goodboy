import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Only local, trusted SVGs (country flags) are served through next/image.
    dangerouslyAllowSVG: true,
  },
  // `next dev`/`next start` auto-detect AI coding agents and rewrite CLAUDE.md
  // with a managed docs-pointer block on every run — opt out, since this repo
  // already has its own CLAUDE.md content.
  agentRules: false,
};

export default withNextIntl(nextConfig);
