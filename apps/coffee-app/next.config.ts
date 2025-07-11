import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  devIndicators: false,
  compiler: {
    styledComponents: true
  }
};

export default nextConfig;
