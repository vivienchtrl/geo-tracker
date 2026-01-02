import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cacheLife: {
      page: {
        stale: 60,
        revalidate: 3600,
        expire: 86400,
      },
    },
  },
};

export default nextConfig;
