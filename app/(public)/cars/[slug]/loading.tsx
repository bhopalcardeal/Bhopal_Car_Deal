import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CarDetailLoading() {
  return (
    <main className="min-h-screen bg-background pb-24 animate-in fade-in duration-150">
      {/* Breadcrumb Navigation Skeleton */}
      <div className="border-b border-border bg-muted/20 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12 rounded" />
            <span className="text-muted-foreground text-xs">/</span>
            <Skeleton className="h-4 w-16 rounded" />
            <span className="text-muted-foreground text-xs">/</span>
            <Skeleton className="h-4 w-20 rounded" />
            <span className="text-muted-foreground text-xs">/</span>
            <Skeleton className="h-4 w-40 rounded" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Top Grid: Gallery (Left 65%) + Purchase Action Card (Right 35%) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Gallery Skeleton */}
          <div className="lg:col-span-8 space-y-6">
            {/* Main Image Aspect Ratio 16/10 */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-muted">
              <Skeleton className="h-full w-full" />
              <div className="absolute bottom-3 right-3">
                <Skeleton className="h-6 w-16 rounded-full bg-black/40" />
              </div>
            </div>

            {/* Quick Benefits Strip Skeleton */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-2xs">
                  <Skeleton className="size-5 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sticky Details & Purchase Card Skeleton */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              {/* Badges & Title Skeleton */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
                <Skeleton className="h-8 w-4/5 rounded-lg" />
                <Skeleton className="h-5 w-2/3 rounded-md" />

                {/* Specs Pill Row */}
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
              </div>

              {/* Pricing Block Skeleton */}
              <div className="border-t border-b border-border py-4 space-y-2">
                <div className="flex items-baseline gap-3">
                  <Skeleton className="h-10 w-36 rounded-lg" />
                  <Skeleton className="h-6 w-20 rounded" />
                </div>
                <Skeleton className="h-4 w-48 rounded" />
              </div>

              {/* Action Buttons Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-2.5">
                  <Skeleton className="h-10 rounded-xl" />
                  <Skeleton className="h-10 rounded-xl" />
                </div>
              </div>

              {/* Price Summary Skeleton */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2.5">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-32 rounded" />
                  <Skeleton className="h-3.5 w-16 rounded" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-3.5 w-20 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Technical Specifications Table Skeleton */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 border-t border-border pt-12">
          <div className="lg:col-span-8 space-y-10">
            {/* Overview Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-44 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>

            {/* Spec Table Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-52 rounded" />
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                  <div className="divide-y divide-border p-2 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex justify-between py-2 px-2">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-4 w-28 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="divide-y divide-border p-2 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex justify-between py-2 px-2">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-4 w-28 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
