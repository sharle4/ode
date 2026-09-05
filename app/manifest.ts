import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ode — Poésie & Littérature",
    short_name: "ode",
    description:
      "Explorez la plus grande base de données de poèmes au monde. Notez, découvrez et discutez de poèmes de toutes les époques avec une communauté de lecteurs passionnés.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#FFFCF2",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
