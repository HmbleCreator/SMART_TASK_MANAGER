/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Optional: speeds up deployment if you're not using Image Optimization
  },
};

export default nextConfig;
