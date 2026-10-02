import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function CarsSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs animate-pulse"
        >
          {/* Media / Image Skeleton (Exact aspect-[16/10]) */}
          <div className="relative aspect-[16/10] w-full bg-muted/80 overflow-hidden">
            {/* Top Left Badge Skeleton */}
            <div className="absolute left-3 top-3 flex gap-1.5 z-10">
              <Skeleton className="h-5 w-20 rounded-md bg-background/60" />
            </div>

            {/* Top Right RTO Pill Skeleton */}
            <div className="absolute right-3 top-3 z-10">
              <Skeleton className="h-5 w-14 rounded-md bg-background/60" />
            </div>

            {/* Bottom Left EMI Pill Skeleton */}
            <div className="absolute bottom-3 left-3 z-10">
              <Skeleton className="h-6 w-36 rounded-md bg-background/70" />
            </div>
          </div>

          {/* Details Container (Exact padding and vertical rhythm) */}
          <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
            <div className="space-y-2.5">
              {/* Title Placeholder (2 Lines, min-h-[3rem]) */}
              <div className="min-h-[3rem] space-y-1.5 pt-0.5">
                <Skeleton className="h-4 w-5/6 rounded-md bg-muted/80" />
                <Skeleton className="h-4 w-3/5 rounded-md bg-muted/80" />
              </div>

              {/* Specs Row Placeholder */}
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-3.5 w-16 rounded-md bg-muted/60" />
                <span className="text-muted-foreground/30">•</span>
                <Skeleton className="h-3.5 w-14 rounded-md bg-muted/60" />
                <span className="text-muted-foreground/30">•</span>
                <Skeleton className="h-3.5 w-14 rounded-md bg-muted/60" />
              </div>

              {/* Tags Placeholder (min-h-[1.75rem]) */}
              <div className="min-h-[1.75rem] flex items-center gap-1.5">
                <Skeleton className="h-5 w-28 rounded-md bg-muted/50" />
                <Skeleton className="h-5 w-20 rounded-md bg-muted/50" />
              </div>
            </div>

            {/* Pricing & CTA Footer (Exact border-t and heights) */}
            <div className="border-t border-border pt-4 mt-auto flex items-center justify-between gap-3">
              <div className="space-y-1">
                <Skeleton className="h-6 w-28 rounded-md bg-muted/80" />
                <Skeleton className="h-2.5 w-24 rounded-md bg-muted/40" />
              </div>

              <Skeleton className="h-8 w-16 rounded-md bg-primary/20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
