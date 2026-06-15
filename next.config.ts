import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  async rewrites() {
    return [
      // Serve branded SVG when browsers request /favicon.ico (e.g. on robots.txt, sitemap.xml tabs)
      { source: "/favicon.ico", destination: "/favicon.svg" },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js", "@supabase/ssr"],
  },
};

export default nextConfig;
