import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dev/"] },
    sitemap: new URL("/sitemap.xml", site).href,
  };
}
