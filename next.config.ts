import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "canvas", "pdf-img-convert"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
