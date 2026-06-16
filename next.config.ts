import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  // Next.js needs unsafe-inline for hydration scripts; JSON-LD blocks also need it
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // Images from Supabase storage, CDN, Unsplash, AWS
  "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://images.unsplash.com https://*.amazonaws.com https://cdn.promptbulletin.com",
  "font-src 'self'",
  // Supabase API + realtime WebSocket
  "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://cdn.promptbulletin.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options",       value: "nosniff" },
  { key: "X-Frame-Options",              value: "SAMEORIGIN" },
  { key: "Referrer-Policy",              value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",           value: "camera=(), microphone=(), geolocation=()" },
  // 2-year HSTS — enable preload once you've confirmed HTTPS is solid
  { key: "Strict-Transport-Security",    value: "max-age=63072000; includeSubDomains" },
  { key: "Content-Security-Policy",      value: CSP },
];

const nextConfig: NextConfig = {
  compress: true,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
    ];
  },
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
