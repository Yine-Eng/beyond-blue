import type { MetadataRoute } from "next";

/** Installable PWA: opens straight into the student's plan, full-screen, in the brand blue. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Beyond Blue",
    short_name: "Beyond Blue",
    description:
      "From Countdown to Launchpad: your 100-day plan for life after graduation at Bluefield State.",
    start_url: "/home?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#174380",
    theme_color: "#174380",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "My plan", url: "/plan", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      {
        name: "Launch File",
        url: "/launch-file",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
