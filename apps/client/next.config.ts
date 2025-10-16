import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Match any path under /api
        destination: 'http://localhost:3000/:path*', // Proxy to your external API (TODO: add process.env condition)
      },
    ];
  },
};

export default nextConfig;
