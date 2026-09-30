import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // packages/sdk ships TypeScript source (vendored as a tarball so `vercel deploy` from apps/web works).
  transpilePackages: ["@viber/sdk"],
};

export default nextConfig;
