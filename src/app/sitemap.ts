import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  const routes = [
    "",
    "/new",
    "/songs",
    "/albums",
    "/artists",
    "/playlists",
    "/favorites",
    "/recently-played",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/new" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
