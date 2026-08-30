import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  experimental: {
    // The project runs TypeScript 7 (`tsc`, via the `@typescript/native` alias)
    // side by side with the TypeScript 6 JS API (the `typescript` package),
    // which typescript-eslint still requires. The TS 6 package only ships a
    // `tsc6` binary, so `next build` has to type check through the API rather
    // than shelling out to `typescript/bin/tsc`.
    useTypeScriptCli: false,
  },
  transpilePackages: [
    "streamdown",
    "@streamdown/code",
    "@streamdown/mermaid",
    "@streamdown/math",
    "mermaid",
  ],
};

export default nextConfig;
