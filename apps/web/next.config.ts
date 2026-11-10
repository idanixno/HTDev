import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@zharfa/ui"],
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["@zharfa/ui"],
  },
};

export default nextConfig;
