import type {NextConfig} from 'next';



const nextConfig: NextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos', // Allow images from picsum.photos
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
