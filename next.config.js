/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'http://0.0.0.0:3000',
    'http://localhost:3000',
  ],
  webpack: (config, _) => {
    return {
      ...config,
      watchOptions: {
        ...config.watchOptions,
        poll: 800,
        aggregateTimeout: 300,
      },
    };
  },
};

module.exports = nextConfig;