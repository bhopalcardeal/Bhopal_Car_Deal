"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FiltersSidebar } from "@/components/cars/filters-sidebar";
import { FilterState } from "@/lib/store/use-filter-store";
import { SlidersHorizontal } from "lucide-react";

interface FiltersSheetProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
  availableBrands: string[];
  totalResults: number;
}

export function FiltersSheet(props: FiltersSheetProps) {
  const [open, setOpen] = useState(false);

  // Count active non-default filters
  const activeCount = [
    props.filters.brand !== "",
    props.filters.maxPrice < 8000000,
    props.filters.minYear > 2018,
    props.filters.fuelType !== "",
    props.filters.transmission !== "",
    props.filters.maxKm < 100000,
    props.filters.registrationState !== "",
    props.filters.bodyType !== "",
    !props.filters.showSold,
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-10 rounded-xl px-4 font-semibold">
          <SlidersHorizontal className="size-4 text-primary" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0 overflow-y-auto">
        <SheetHeader className="p-4 border-b border-border sticky top-0 bg-background z-10">
          <SheetTitle className="text-left font-bold text-base flex items-center justify-between pr-6">
            <span>Filter Inventory</span>
            <span className="text-xs font-normal text-muted-foreground">
              {props.totalResults} Cars Found
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <FiltersSidebar {...props} />
          <div className="pt-4 pb-6 sticky bottom-0 bg-background/95 backdrop-blur-xs border-t border-border mt-4">
            <Button className="w-full" onClick={() => setOpen(false)}>
              Show {props.totalResults} Cars
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
