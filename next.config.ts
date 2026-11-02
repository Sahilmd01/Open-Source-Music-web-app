import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.telegram.org",
      },
      // Telegram CDN uses regional subdomains like cdn4.cdn-telegram.org
      {
        protocol: "https",
        hostname: "*.cdn-telegram.org",
      },
    ],
  },
  // Increase the body size limit for API routes that handle file uploads
  // (audio/image multipart forms). Vercel hard limit is 4.5MB for JSON,
  // but multipart via /api/v1/storage/upload is handled separately.
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
