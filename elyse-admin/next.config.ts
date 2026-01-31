import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_API_URL: "http://localhost:3001/api/v1",
  },
  reactCompiler: true,
};

export default nextConfig;
