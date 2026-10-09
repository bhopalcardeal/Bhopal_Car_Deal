"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CarCard } from "@/components/cars/car-card";
import type { PublicCarListing, PublicCarCardListing } from "@/lib/db";
import { Car, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarGridProps {
  cars: (PublicCarCardListing | PublicCarListing)[];
  onResetFilters?: () => void;
}

export function CarGrid({ cars, onResetFilters }: CarGridProps) {
  if (!cars || cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 px-6 text-center space-y-4 bg-muted/10">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Car className="size-7" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-lg font-bold text-foreground">No matching vehicles found</h3>
          <p className="text-xs text-muted-foreground">
            Try adjusting your price range, fuel type, or clear some filters to see available certified stock.
          </p>
        </div>
        {onResetFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters} className="gap-2">
            <RefreshCw className="size-3.5" />
            <span>Reset All Filters</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <AnimatePresence mode="popLayout">
        {cars.map((car) => (
          <motion.div
            key={car.id}
            layout
            className="h-full"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
          >
            <CarCard car={car} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
