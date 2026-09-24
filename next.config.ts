import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Photos des pièces et véhicules servies par le stockage Opisto
      { protocol: "https", hostname: "**.bso.st" },
      { protocol: "https", hostname: "**.opisto.fr" },
      { protocol: "https", hostname: "**.opisto.com" },
    ],
  },
};

export default nextConfig;
