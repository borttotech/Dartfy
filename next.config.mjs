// JavaScript puro (sem TypeScript), igual aos outros projetos: carrega sem depender do SWC no host de build.

/** @type {import("next").NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Permite abrir o `next dev` pelo celular na mesma rede Wi-Fi.
  allowedDevOrigins: ["192.168.*.*"],
  async headers() {
    const privateHeaders = [
      { key: "Cache-Control", value: "private, no-store" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ];
    return [
      { source: "/(convites|meets|criar|perfil)/:path*", headers: privateHeaders },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
