import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/cars/car-card";
import type { PublicCarListing, PublicCarCardListing } from "@/lib/db";
import { ArrowRight, Sparkles } from "lucide-react";

interface FeaturedCarsProps {
  cars: (PublicCarCardListing | PublicCarListing)[];
  soldCars?: (PublicCarCardListing | PublicCarListing)[];
}

export function FeaturedCars({ cars, soldCars }: FeaturedCarsProps) {
  const liveCars = cars.filter((c) => c.status !== "SOLD");
  const soldList = soldCars && soldCars.length > 0 ? soldCars : cars.filter((c) => c.status === "SOLD");

  if (liveCars.length === 0 && soldList.length === 0) {
    return (
      <section className="py-20 sm:py-28 bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>Curated Showroom • Bhopal &amp; Indore</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Featured Pre-Owned Vehicles
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Our certified inventory is currently being refreshed with fresh arrivals. Check back shortly or contact our showroom directly for off-market luxury and family cars.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button asChild className="gap-2 font-semibold">
                <Link href="/sell-your-car">
                  <span>Sell Your Car</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 font-semibold">
                <Link href="/contact">
                  <span>Contact Showroom</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 sm:py-28 bg-background border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3" />
              <span>Handpicked Luxury • Bhopal &amp; Indore</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Featured Pre-Owned Vehicles
            </h2>
            <p className="text-sm text-muted-foreground">
              Inspected, certified, and ready for immediate delivery across Bhopal &amp; Madhya Pradesh.
            </p>
          </div>

          <Button asChild variant="outline" className="gap-2 self-start sm:self-auto font-semibold">
            <Link href="/cars">
              <span>View All Inventory</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* 3-Column Car Grid (Available Vehicles) */}
        {liveCars.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {liveCars.map((car, idx) => (
              <CarCard key={car.id} car={car} priorityImage={idx < 3} />
            ))}
          </div>
        )}

        {/* Sold Out & Delivered Vehicles Showcase (at the bottom of home inventory) */}
        {soldList.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                  <span className="size-2 rounded-full bg-red-500" />
                  <span>Delivered to Happy Owners</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Recently Delivered / Sold Out
                </h3>
                <p className="text-sm text-muted-foreground">
                  These verified pre-owned vehicles were recently delivered to clients in Bhopal &amp; Indore. Kept for specification &amp; pricing benchmark.
                </p>
              </div>

              <Button asChild variant="outline" className="gap-2 self-start sm:self-auto font-semibold">
                <Link href="/sell-your-car">
                  <span>Sell Your Car With Us</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {soldList.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
