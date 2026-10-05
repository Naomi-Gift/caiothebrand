import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/account", "/cart", "/checkout", "/track/", "/auth", "/403"],
    },
    sitemap: "https://www.caiopizza.com/sitemap.xml",
  };
}
