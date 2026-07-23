import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coiffeurs 225 — Barbiers à domicile",
    short_name: "Coiffeurs225",
    description:
      "Réservez les meilleurs barbiers et coiffeurs d'Abidjan à domicile, commandez votre kit de coiffure et gérez votre abonnement.",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1714",
    theme_color: "#1a1714",
    icons: [
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
