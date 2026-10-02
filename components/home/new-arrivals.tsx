import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/cars/car-card";
import type { PublicCarListing } from "@/lib/db";
import { ArrowRight, Flame } from "lucide-react";

interface NewArrivalsProps {
  cars: PublicCarListing[];
}

export function NewArrivals({ cars }: NewArrivalsProps) {
  if (!cars || cars.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-muted/15 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Flame className="size-3" />
              <span>Just Added to Inventory</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              New Arrivals This Week
            </h2>
            <p className="text-sm text-muted-foreground">
              Freshly certified luxury stock just inducted from physical evaluation.
            </p>
          </div>

          <Button asChild variant="outline" className="gap-2 self-start sm:self-auto font-semibold">
            <Link href="/cars?sort=recently_added">
              <span>View All New Arrivals</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </section>
  );
}
