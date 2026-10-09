import React from "react";
import { CarsSkeleton } from "@/components/cars/cars-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CarsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 animate-in fade-in duration-150">
      {/* Top Header Skeleton */}
      <div className="space-y-4 mb-8">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-10 w-72 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar Skeleton */}
        <div className="hidden lg:block lg:col-span-1 space-y-6 rounded-2xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-32 rounded" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* Cars Grid */}
        <div className="lg:col-span-3">
          <CarsSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
