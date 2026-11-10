import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Monorepo: keep file tracing rooted at the repo, not only apps/web.
  outputFileTracingRoot: path.join(appDir, "../.."),
};

export default nextConfig;
