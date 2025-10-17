import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/external-api/:path*', // Match any path under /api
        destination: 'https://api-zeta-puce-36.vercel.app/:path*', // Proxy to destination
      },
    ];
  },
};

export default nextConfig;
