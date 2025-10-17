import CONSTANTS from "@/constants";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/external-api/:path*', // Match any path under /external-api
        destination: `${CONSTANTS.API_DOMAIN}/:path*`, // Proxy to destination
      },
    ];
  },
};

export default nextConfig;
