import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'msjhtyjbkghmqwmtiaqz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/avatars/**',
      },
    ],
  },
};

export default nextConfig;
