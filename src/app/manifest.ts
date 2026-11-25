import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/** Instalar na tela inicial do celular (PWA). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#07051a",
    theme_color: "#07051a",
    icons: [
      { src: "/brand/dartfy-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/dartfy-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
