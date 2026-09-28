import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Temporarily disabled next-pwa because it causes config loading errors with Next.js 15.
  // We can re-enable a modern PWA solution later.
};

export default nextConfig;
