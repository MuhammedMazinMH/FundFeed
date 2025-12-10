/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'reatyrgiopykkicukjof.supabase.co',
      'lh3.googleusercontent.com',
    ],
  },
  experimental: {
    forceSwcTransforms: true,
  },
};

module.exports = nextConfig;
