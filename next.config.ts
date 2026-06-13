import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "web.archive.org" },
      { protocol: "https", hostname: "tapsknrszmfhuwzvovem.supabase.co" },
      { protocol: "https", hostname: "atacadoparaguai.com" },
    ],
  },
};

export default nextConfig;
