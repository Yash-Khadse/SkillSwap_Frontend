/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
  webpack: (config, { dev, isServer }) => {
    // Ensure proper cache handling
    if (dev && !isServer) {
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
      };
    }
    return config;
  },
}

module.exports = nextConfig