import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // experimental: {
  //   ppr: 'incremental',
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https', // Match https protocol
        hostname: '**',    // Match any hostname (wildcard for all domains)
      },
    ],
    domains: ['avatars.githubusercontent.com','drive.google.com'], // Add the domain here
  },
};

export default nextConfig;
