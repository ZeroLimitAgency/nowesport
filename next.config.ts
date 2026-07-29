import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  async redirects() {
    return [
      { source: "/boutique", destination: "/shop", permanent: true },
      { source: "/partenaires", destination: "/partners", permanent: true },
      { source: "/teams", destination: "/roster", permanent: true },
      { source: "/teams/:slug", destination: "/roster/:slug", permanent: true },
      { source: "/panier", destination: "/cart", permanent: true },
      { source: "/profil", destination: "/profile", permanent: true },
      { source: "/account", destination: "/compte", permanent: true },
    ];
  },
};

export default nextConfig;
