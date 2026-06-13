import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "web.archive.org" },
    ],
  },
};

export default nextConfig;
