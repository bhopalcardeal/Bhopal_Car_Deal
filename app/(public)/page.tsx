import React from "react";
import { prisma, PUBLIC_CAR_SELECT, type PublicCarListing } from "@/lib/db";
import type { Testimonial, FAQ } from "@prisma/client";
import { HeroSection } from "@/components/home/hero-section";
import { TrustSection } from "@/components/home/trust-section";
import { FeaturedCars } from "@/components/home/featured-cars";
import { NewArrivals } from "@/components/home/new-arrivals";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FAQsSection } from "@/components/home/faqs-section";

// Server Component with ISR revalidation every 5 minutes
export const revalidate = 300;

export default async function HomePage() {
  let featuredCars: PublicCarListing[] = [];
  let newArrivals: PublicCarListing[] = [];
  let totalCarsCount = 0;
  let testimonials: Testimonial[] = [];
  let faqs: FAQ[] = [];

  try {
    [featuredCars, newArrivals, totalCarsCount, testimonials, faqs] =
      await Promise.all([
        prisma.carListing.findMany({
          where: {
            status: "LIVE",
            isFeatured: true,
          },
          select: PUBLIC_CAR_SELECT,
          take: 6,
          orderBy: { createdAt: "desc" },
        }),
        prisma.carListing.findMany({
          where: {
            status: "LIVE",
            isNewArrival: true,
          },
          select: PUBLIC_CAR_SELECT,
          take: 6,
          orderBy: { createdAt: "desc" },
        }),
        prisma.carListing.count({
          where: { status: "LIVE" },
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
  } catch (error) {
    console.warn("[HomePage] Database query warning (using fallbacks):", error);
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section with Parallax & Ambient Vengeance UI Glow */}
      <HeroSection totalCarsCount={totalCarsCount} />

      {/* Trust & USP Staggered Entrance Section */}
      <TrustSection />

      {/* Featured Cars Section */}
      <FeaturedCars cars={featuredCars} />

      {/* New Arrivals Section */}
      <NewArrivals cars={newArrivals} />

      {/* Testimonials Marquee Section */}
      <TestimonialsSection testimonials={testimonials} />

      {/* FAQs Section */}
      <FAQsSection faqs={faqs} />
    </main>
  );
}
