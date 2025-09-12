import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  /* outras opções de config aqui */
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
