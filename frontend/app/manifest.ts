import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OCRganise",
    short_name: "OCRganise",
    description: "Track your expenses and manage your budget with split and scan features",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1a2e",
    theme_color: "#ffd700",
    icons: [
      {
        src: "/logo_app.jpeg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/logo_app.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  }
}
