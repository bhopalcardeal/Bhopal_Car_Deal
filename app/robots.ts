import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXTAUTH_URL ||
  "https://bhopal-car-deal.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/admin/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
