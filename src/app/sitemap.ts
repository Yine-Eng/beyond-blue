import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/** Only the public story site is indexed; the app lives behind sign-in. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: getSiteUrl().href, changeFrequency: "weekly", priority: 1 }];
}
