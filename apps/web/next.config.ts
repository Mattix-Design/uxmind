import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@uxmind/types", "@uxmind/scoring"],
};

export default nextConfig;
