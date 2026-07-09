import type { NextConfig } from "next";

// Platform-agnostic prototype: plain <img> tags referencing the original
// WordPress media URLs (no re-hosting), no Next-specific image pipeline,
// so every component maps 1:1 to a Framer code component or a Webflow build.
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
