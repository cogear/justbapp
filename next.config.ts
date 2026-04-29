import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'justbblog.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // /products/<slug> proxies to the egmarket public render route. The CMS
  // (egmarket) at thewelist.com is the source of truth for lander HTML;
  // this site is a thin proxy so the URL bar reads theblife.com/products/...
  async rewrites() {
    return [
      {
        source: '/products/:slug',
        destination: 'https://thewelist.com/p/:slug',
      },
    ];
  },
};

export default nextConfig;
