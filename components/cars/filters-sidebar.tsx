"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPriceINR, formatKm } from "@/lib/utils/formatters";
import { FilterState } from "@/lib/store/use-filter-store";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface FiltersSidebarProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
  availableBrands: string[];
  totalResults: number;
}

const BODY_TYPES = [
  { label: "All", value: "" },
  { label: "SUV", value: "SUV" },
  { label: "Sedan", value: "SEDAN" },
  { label: "Hatchback", value: "HATCHBACK" },
  { label: "MUV", value: "MUV" },
];

const FUEL_TYPES = [
  { label: "All", value: "" },
  { label: "Petrol", value: "PETROL" },
  { label: "Diesel", value: "DIESEL" },
  { label: "Hybrid", value: "HYBRID" },
  { label: "Electric", value: "ELECTRIC" },
];

const TRANSMISSIONS = [
  { label: "All", value: "" },
  { label: "Automatic", value: "AUTOMATIC" },
  { label: "Manual", value: "MANUAL" },
];

const RTO_STATES = [
  { label: "All States", value: "" },
  { label: "Madhya Pradesh (MP)", value: "MP" },
  { label: "Maharashtra (MH)", value: "MH" },
  { label: "Delhi (DL)", value: "DL" },
  { label: "Uttar Pradesh (UP)", value: "UP" },
];

export function FiltersSidebar({
  filters,
  onFilterChange,
  onReset,
  availableBrands,
  totalResults,
}: FiltersSidebarProps) {
  const isFiltered =
    filters.brand !== "" ||
    filters.maxPrice < 8000000 ||
    filters.minYear > 2018 ||
    filters.fuelType !== "" ||
    filters.transmission !== "" ||
    filters.maxKm < 100000 ||
    filters.registrationState !== "" ||
    filters.bodyType !== "" ||
    !filters.showSold;

  return (
    <div className="flex flex-col space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
      {/* Header with Clear Action */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primary" />
          <h3 className="font-bold text-base text-foreground">Filter Stock</h3>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
            {totalResults}
          </span>
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* 1. Brand Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Brand / Manufacturer
        </label>
        <Select
          value={filters.brand || "ALL_BRANDS"}
          onValueChange={(val) => onFilterChange("brand", val === "ALL_BRANDS" ? "" : val)}
        >
          <SelectTrigger className="w-full bg-background border-border text-xs sm:text-sm">
            <SelectValue placeholder="All Manufacturers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL_BRANDS">All Manufacturers</SelectItem>
            {availableBrands.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. Price Range Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Max Budget
          </label>
          <span className="text-xs font-black text-primary">
            {formatPriceINR(filters.maxPrice)}
          </span>
        </div>
        <Slider
          value={[filters.maxPrice]}
          onValueChange={([val]) => onFilterChange("maxPrice", val ?? 8000000)}
          min={500000}
          max={8000000}
          step={100000}
        />
        <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
          <span>₹5 Lakh</span>
          <span>₹40 Lakh</span>
          <span>₹80 Lakh</span>
        </div>
      </div>

      {/* 3. Body Type Pills */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Body Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {BODY_TYPES.map((bt) => {
            const isSelected = filters.bodyType === bt.value;
            return (
              <button
                key={bt.label}
                type="button"
                onClick={() => onFilterChange("bodyType", isSelected ? "" : bt.value)}
                className={cn(
                  "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150 border",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                )}
              >
                {bt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Fuel Type Pills */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Fuel Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {FUEL_TYPES.map((ft) => {
            const isSelected = filters.fuelType === ft.value;
            return (
              <button
                key={ft.label}
                type="button"
                onClick={() => onFilterChange("fuelType", isSelected ? "" : ft.value)}
                className={cn(
                  "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150 border",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                )}
              >
                {ft.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Transmission Pills */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Transmission
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TRANSMISSIONS.map((tr) => {
            const isSelected = filters.transmission === tr.value;
            return (
              <button
                key={tr.label}
                type="button"
                onClick={() => onFilterChange("transmission", isSelected ? "" : tr.value)}
                className={cn(
                  "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150 border",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                )}
              >
                {tr.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Maximum KM Driven */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Max KM Driven
          </label>
          <span className="text-xs font-black text-primary">
            {formatKm(filters.maxKm)}
          </span>
        </div>
        <Slider
          value={[filters.maxKm]}
          onValueChange={([val]) => onFilterChange("maxKm", val ?? 100000)}
          min={10000}
          max={100000}
          step={5000}
        />
        <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
          <span>10k km</span>
          <span>50k km</span>
          <span>100k km</span>
        </div>
      </div>

      {/* 7. Registration State (RTO) */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          RTO / Registration State
        </label>
        <Select
          value={filters.registrationState || "ALL_STATES"}
          onValueChange={(val) => onFilterChange("registrationState", val === "ALL_STATES" ? "" : val)}
        >
          <SelectTrigger className="w-full bg-background border-border text-xs sm:text-sm">
            <SelectValue placeholder="All RTOs" />
          </SelectTrigger>
          <SelectContent>
            {RTO_STATES.map((s) => (
              <SelectItem key={s.label} value={s.value || "ALL_STATES"}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 8. Minimum Year */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Model Year (From)
        </label>
        <Select
          value={String(filters.minYear)}
          onValueChange={(val) => onFilterChange("minYear", Number(val))}
        >
          <SelectTrigger className="w-full bg-background border-border text-xs sm:text-sm">
            <SelectValue placeholder="2018 or newer" />
          </SelectTrigger>
          <SelectContent>
            {[2018, 2019, 2020, 2021, 2022, 2023, 2024].map((yr) => (
              <SelectItem key={yr} value={String(yr)}>
                {yr} or newer
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 9. Show Sold Toggle (Per PRD) */}
      <div className="border-t border-border pt-4">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-foreground">Include Sold Cars</span>
            <p className="text-[10px] text-muted-foreground">Show archive for pricing reference</p>
          </div>
          <input
            type="checkbox"
            checked={filters.showSold}
            onChange={(e) => onFilterChange("showSold", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}
