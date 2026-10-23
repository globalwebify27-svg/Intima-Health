import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
