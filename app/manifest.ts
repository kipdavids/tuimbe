import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app.config";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appConfig.appName, short_name: appConfig.appName, description: appConfig.tagline,
    start_url: "/", display: "standalone", background_color: "#FBF8F3", theme_color: appConfig.primaryColor,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
