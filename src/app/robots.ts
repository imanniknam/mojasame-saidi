import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/cart",
          "/checkout",
          "/orders",
          "/profile",
          "/favorites",
          "/search",
          "/login/forgot",
          "/login/reset",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
