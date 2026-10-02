import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE_URL =
  process.env.NEXTAUTH_URL ||
  "https://bhopal-car-deal.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/cars`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/sell-your-car`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const liveCars = await prisma.carListing.findMany({
      where: { status: "LIVE" },
      select: {
        slug: true,
        updatedAt: true,
      },
      take: 200,
    });

    const dynamicCarRoutes: MetadataRoute.Sitemap = liveCars.map((car) => ({
      url: `${BASE_URL}/cars/${car.slug}`,
      lastModified: car.updatedAt,
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    return [...staticRoutes, ...dynamicCarRoutes];
  } catch (error) {
    console.warn("[Sitemap] Failed to fetch live cars for sitemap:", error);
    return staticRoutes;
  }
}
