import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TikiTaka",
    short_name: "TikiTaka",
    description: "Porras de fútbol con amigos y fantasy.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c1510",
    theme_color: "#0c1510",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

