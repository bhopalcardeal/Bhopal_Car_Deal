import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/cars/car-card";
import type { PublicCarListing } from "@/lib/db";
import { ArrowRight, Sparkles } from "lucide-react";

interface FeaturedCarsProps {
  cars: PublicCarListing[];
}

export function FeaturedCars({ cars }: FeaturedCarsProps) {
  if (!cars || cars.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-background border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3" />
              <span>Handpicked Luxury</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Featured Pre-Owned Vehicles
            </h2>
            <p className="text-sm text-muted-foreground">
              Inspected, certified, and ready for immediate delivery across Bhopal &amp; Madhya Pradesh.
            </p>
          </div>

          <Button asChild variant="outline" className="gap-2 self-start sm:self-auto font-semibold">
            <Link href="/cars?featured=true">
              <span>View All Featured</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* 3-Column Car Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car, idx) => (
            <CarCard key={car.id} car={car} priorityImage={idx < 3} />
          ))}
        </div>
      </div>
    </section>
  );
}
