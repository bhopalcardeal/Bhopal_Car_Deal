import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Compress responses with gzip / brotli for faster network transfer
  compress: true,

  // Remove X-Powered-By header to reduce response byte overhead & enhance security
  poweredByHeader: false,

  // High-performance image optimization (AVIF & WebP) + 30-day edge CDN caching
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Tree-shake & optimize large library imports to reduce First Load JS bundle size
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "motion",
      "recharts",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-slider",
      "@radix-ui/react-tabs",
      "@radix-ui/react-slot",
    ],
  },

  // Edge Caching headers for static assets, fonts, and images
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
