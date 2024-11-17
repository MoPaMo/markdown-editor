import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */

    distDir: 'dist',
    output: 'export',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
      },
};

export default nextConfig;
