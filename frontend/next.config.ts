import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // keep the backend's exact paths (incl. the intentional trailing slash on
  // PUT/DELETE /api/v1/trips/{id}/) intact when proxied through /bff
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/bff/:path*", destination: `${BACKEND_URL}/:path*` },
    ];
  },
};

export default nextConfig;
