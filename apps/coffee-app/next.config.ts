import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  devIndicators: false,
  compiler: {
    styledComponents: true
  }
};

export default nextConfig;
