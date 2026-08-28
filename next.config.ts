import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  transpilePackages: [
    "streamdown",
    "@streamdown/code",
    "@streamdown/mermaid",
    "@streamdown/math",
    "mermaid",
  ],
};

export default nextConfig;
