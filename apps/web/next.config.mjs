/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@franchisli/ui"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "franchisli-web.vercel.app",
        "*.vercel.app",
      ],
    },
  },
};

export default nextConfig;
