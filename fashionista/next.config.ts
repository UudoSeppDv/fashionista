import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tjeuitendjxjkmbtulxn.supabase.co',
        pathname: '/storage/v1/object/**', // Matches both /public/** and /sign/**
      },
    ],
  },
};

export default nextConfig;
