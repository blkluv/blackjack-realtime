/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.multiavatar.com',
        port: '',
        pathname: '/**',
      },
      {
        hostname: 'multiavatar.com',
      },
    ],
  },
};

export default nextConfig;
