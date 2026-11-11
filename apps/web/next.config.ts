import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@zharfa/ui"],
  poweredByHeader: false,
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@zharfa/ui"],
  },
};

export default nextConfig;
