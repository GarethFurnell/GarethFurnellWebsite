import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/GarethFurnellWebsite/src/app/page.tsx',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
