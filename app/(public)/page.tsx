import React from "react";
import { prisma, PUBLIC_CAR_SELECT, type PublicCarListing } from "@/lib/db";
import type { Testimonial, FAQ } from "@prisma/client";
import { HeroSection } from "@/components/home/hero-section";
import { TrustSection } from "@/components/home/trust-section";
import { FeaturedCars } from "@/components/home/featured-cars";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FAQsSection } from "@/components/home/faqs-section";

// Server Component with ISR revalidation every 5 minutes
export const revalidate = 300;

export default async function HomePage() {
  let liveCars: PublicCarListing[] = [];
  let soldCars: PublicCarListing[] = [];
  let totalCarsCount = 0;
  let testimonials: Testimonial[] = [];
  let faqs: FAQ[] = [];

  try {
    const [allLive, allSold, testimonialsData, faqsData] =
      await Promise.all([
        prisma.carListing.findMany({
          where: {
            status: "LIVE",
          },
          select: PUBLIC_CAR_SELECT,
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        }),
        prisma.carListing.findMany({
          where: {
            status: "SOLD",
          },
          select: PUBLIC_CAR_SELECT,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.testimonial.findMany({
          where: { featured: true },
          take: 6,
          orderBy: { createdAt: "desc" },
        }),
        prisma.fAQ.findMany({
          where: { active: true },
          orderBy: { order: "asc" },
        }),
      ]);

    liveCars = allLive;
    soldCars = allSold;
    totalCarsCount = allLive.length + allSold.length;
    testimonials = testimonialsData;
    faqs = faqsData;
  } catch (error) {
    console.warn("[HomePage] Database query warning (using fallbacks):", error);
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section with Parallax & Ambient Vengeance UI Glow */}
      <HeroSection totalCarsCount={totalCarsCount} />

      {/* Trust & USP Staggered Entrance Section */}
      <TrustSection />

      {/* Showroom Cars Section with Available Stock & Sold Out at Bottom */}
      <FeaturedCars cars={liveCars} soldCars={soldCars} />

      {/* Testimonials Marquee Section */}
      <TestimonialsSection testimonials={testimonials} />

      {/* FAQs Section */}
      <FAQsSection faqs={faqs} />
    </main>
  );
}
