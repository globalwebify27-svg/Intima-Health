import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@tanstack/react-table",
      "@tanstack/react-query",
    ],
  },
  async redirects() {
    return [
      {
        source: "/cancellation-policy",
        destination: "/refund-policy",
        permanent: true,
      },
      {
        source: "/refund-and-cancellation-policy",
        destination: "/refund-policy",
        permanent: true,
      },
      {
        source: "/cancellation-and-refund-policy",
        destination: "/refund-policy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
