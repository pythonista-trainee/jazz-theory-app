/** @type {import('next').NextConfig} */
const nextConfig = {
  // vexflow uses browser APIs; exclude from SSR bundling
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals ?? []), "vexflow", "tone"];
    }
    return config;
  },
};

module.exports = nextConfig;
