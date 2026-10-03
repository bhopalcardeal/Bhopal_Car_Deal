import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatPriceINR,
  formatKm,
  calculateStartingEmi,
  formatEmiPerMonth,
} from "@/lib/utils/formatters";
import type { PublicCarListing } from "@/lib/db";
import {
  Fuel,
  Gauge,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/lib/utils/image";

interface CarCardProps {
  car: PublicCarListing;
  priorityImage?: boolean;
  className?: string;
}

export function CarCard({ car, priorityImage = false, className }: CarCardProps) {
  const isSold = car.status === "SOLD";
  const startingEmi = calculateStartingEmi(car.discountedPrice ?? car.price);

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg",
        isSold && "opacity-85",
        className
      )}
    >
      {/* Media / Image Container (Fixed 16/10 Aspect Ratio) */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
        <Image
          src={getOptimizedImageUrl(car.coverImage, { width: 720 })}
          alt={car.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priorityImage}
          className={cn(
            "object-cover transition-transform duration-500 ease-out group-hover:scale-105",
            isSold && "grayscale-[25%] opacity-90"
          )}
        />

        {/* Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
          {isSold ? (
            <Badge variant="destructive" className="bg-red-600 hover:bg-red-600 text-white font-black tracking-wider uppercase text-[10px] px-2.5 py-0.5 shadow-sm">
              ● Sold Out
            </Badge>
          ) : car.isNewArrival ? (
            <Badge variant="featured" className="bg-primary text-primary-foreground font-bold text-[10px] px-2 py-0.5 shadow-sm">
              <Sparkles className="size-3 mr-1" />
              New Arrival
            </Badge>
          ) : car.isFeatured ? (
            <Badge variant="featured" className="bg-primary/90 text-primary-foreground font-bold text-[10px] px-2 py-0.5 shadow-sm">
              Featured
            </Badge>
          ) : null}

          {car.discountPercent && !isSold ? (
            <Badge variant="success" className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 shadow-sm">
              {car.discountPercent}% OFF
            </Badge>
          ) : null}
        </div>

        {/* RTO Tag */}
        <div className="absolute right-3 top-3 z-10">
          <span className="rounded-md border border-white/20 bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
            {car.registrationState} RTO
          </span>
        </div>

        {/* Status / Starting EMI Pill */}
        <div className="absolute bottom-3 left-3 z-10">
          {isSold ? (
            <div className="inline-flex items-center gap-1.5 rounded-md bg-black/85 px-2.5 py-1 text-[11px] font-semibold text-red-300 backdrop-blur-xs border border-red-500/40">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>Vehicle Delivered</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
              <span className="text-white/70">Starting EMI:</span>
              <span className="font-bold text-primary-foreground">{formatEmiPerMonth(startingEmi)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Details Container with Fixed Vertical Rhythm */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2.5">
          {/* Title with Fixed Height (min-h-[3rem]) */}
          <Link href={`/cars/${car.slug}`} className="block focus:outline-none">
            <h3 className="line-clamp-2 min-h-[3rem] text-base font-bold text-foreground transition-colors group-hover:text-primary leading-snug">
              {car.title}
            </h3>
          </Link>

          {/* Quick Specs Line */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Gauge className="size-3.5 text-primary/70 shrink-0" />
              <span>{formatKm(car.kmDriven)}</span>
            </span>
            {car.fuelType && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Fuel className="size-3.5 text-primary/70 shrink-0" />
                  <span className="capitalize">{car.fuelType.toLowerCase()}</span>
                </span>
              </>
            )}
            {car.transmission && (
              <>
                <span>•</span>
                <span className="capitalize">{car.transmission.toLowerCase()}</span>
              </>
            )}
            {car.manufacturingYear && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5 text-primary/70 shrink-0" />
                  <span>{car.manufacturingYear}</span>
                </span>
              </>
            )}
          </div>

          {/* Highlight Tags (Strict Fixed Height min-h-[1.75rem] to prevent height mismatch) */}
          <div className="min-h-[1.75rem] flex flex-wrap items-center gap-1.5">
            {car.highlightTags && car.highlightTags.length > 0 ? (
              car.highlightTags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center rounded-md bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground/60">
                150+ Verified Checkpoints
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA Section (Pinned to Bottom via mt-auto) */}
        <div className="border-t border-border pt-4 mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className={cn("text-xl font-black", isSold ? "text-muted-foreground" : "text-foreground")}>
                {formatPriceINR(car.discountedPrice ?? car.price)}
              </span>
              {car.discountedPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPriceINR(car.price)}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium",
                isSold ? "text-red-500 font-semibold" : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {isSold ? "Delivered • Archival View" : "Fixed Price • RC Included"}
            </span>
          </div>

          <Button
            asChild
            size="sm"
            variant={isSold ? "outline" : "default"}
            className={cn(
              "gap-1 px-3.5 font-semibold shrink-0",
              isSold && "border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
            )}
          >
            <Link href={`/cars/${car.slug}`}>
              <span>{isSold ? "View (Sold)" : "View"}</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
