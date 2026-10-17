import type { NextConfig } from "next";

// Strip trailing "/api" if present so we can safely append paths below
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000")
  .replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Facebook avatar domains (for later)
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
      { protocol: "https", hostname: "graph.facebook.com" },
    ],
  },

  async rewrites() {
    return [
      // Backend tracking API
      {
        source: "/api/track",
        destination: `${API_BASE}/api/track`,
      },

      // Landing-page section routes (client-side scroll anchors)
      { source: "/features", destination: "/" },
      { source: "/how-it-works", destination: "/" },
      { source: "/pricing", destination: "/" },
      { source: "/faq", destination: "/" },
    ];
  },

  async headers() {
    return [
      {
        source: "/track.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ];
  },
};

export default nextConfig;