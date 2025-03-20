import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Enable Turbopack for prod
    turbo: {
      rules: {
        // If  need to use custom css processor "*.scss": ["sass-loader", "css-loader"]
      },
    },
  },
};

export default withNextIntl(nextConfig);
