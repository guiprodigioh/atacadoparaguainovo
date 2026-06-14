import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "web.archive.org" },
      { protocol: "https", hostname: "tapsknrszmfhuwzvovem.supabase.co" },
      { protocol: "https", hostname: "atacadoparaguai.com" },
      { protocol: "https", hostname: "assets.olaclick.app" },
      { protocol: "https", hostname: "xjmapfpfgwoivlsalltb.supabase.co" },
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },
};

export default nextConfig;

if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev()).catch(() => {});
}
