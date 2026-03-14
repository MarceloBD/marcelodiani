import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Marcelo B. Diani - Full Stack Developer & Software Engineer",
    short_name: "Marcelo Diani",
    description: "Full Stack Developer specializing in React, Node.js, TypeScript, and cloud technologies. Portfolio showcasing projects, experience, and technical expertise.",
    start_url: "/",
    display: "standalone",
    background_color: "#050508",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    categories: ["portfolio", "technology", "development"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    lang: "en",
    dir: "ltr",
  };
}
