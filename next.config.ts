import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-expect-error - optimizeFonts is not typed correctly in NextConfig
  optimizeFonts: false,
};

export default nextConfig;
