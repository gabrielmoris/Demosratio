import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Enable Turbopack for prod
    turbo: {},
  },
};

export default withNextIntl(nextConfig);
