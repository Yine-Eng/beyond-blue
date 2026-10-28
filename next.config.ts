import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so a stray lockfile in a parent folder isn't picked up.
  outputFileTracingRoot: process.cwd(),
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
