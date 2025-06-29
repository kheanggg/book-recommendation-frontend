/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'http://0.0.0.0:3000',   // Allow requests from this host
    'http://localhost:3000', // Also allow localhost access
  ],
};

module.exports = nextConfig;