/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@franchisli/ui"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
