"use client";

import React, { useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useFilterStore, FilterState } from "@/lib/store/use-filter-store";
import { SearchBar } from "@/components/cars/search-bar";
import { SortDropdown } from "@/components/cars/sort-dropdown";
import { FiltersSidebar } from "@/components/cars/filters-sidebar";
import { FiltersSheet } from "@/components/cars/filters-sheet";
import { CarGrid } from "@/components/cars/car-grid";
import { PaginationBar } from "@/components/cars/pagination-bar";
import { CarsSkeleton } from "@/components/cars/cars-skeleton";
import type { PublicCarListing, PublicCarCardListing } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles } from "lucide-react";

interface CarsBrowseClientProps {
  initialCars: (PublicCarCardListing | PublicCarListing)[];
  totalCount: number;
  availableBrands: string[];
  currentPage: number;
  itemsPerPage: number;
}

export function CarsBrowseClient({
  initialCars,
  totalCount,
  availableBrands,
  currentPage,
  itemsPerPage,
}: CarsBrowseClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filterState = useFilterStore();
  const { setFilter, resetFilters, initFromParams } = filterState;

  // Sync state from URL search params on mount or URL change
  useEffect(() => {
    const params: Record<string, string | undefined> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
    initFromParams(params);
  }, [searchParams, initFromParams]);

  // Push updated filter state to URL without full-page reload
  const pushFiltersToUrl = (updates: Partial<FilterState>) => {
    const nextState = { ...filterState, ...updates };
    const params = new URLSearchParams();

    if (nextState.brand) params.set("brand", nextState.brand);
    if (nextState.maxPrice < 8000000) params.set("maxPrice", String(nextState.maxPrice));
    if (nextState.minYear > 2018) params.set("minYear", String(nextState.minYear));
    if (nextState.fuelType) params.set("fuelType", nextState.fuelType);
    if (nextState.transmission) params.set("transmission", nextState.transmission);
    if (nextState.maxKm < 100000) params.set("maxKm", String(nextState.maxKm));
    if (nextState.registrationState) params.set("registrationState", nextState.registrationState);
    if (nextState.bodyType) params.set("bodyType", nextState.bodyType);
    if (nextState.search) params.set("search", nextState.search);
    if (nextState.sort && nextState.sort !== "recently_added") params.set("sort", nextState.sort);
    if (nextState.showSold === false) params.set("showSold", "false");
    if (nextState.page > 1) params.set("page", String(nextState.page));

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  };

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilter(key, value);
    pushFiltersToUrl({ [key]: value, page: key === "page" ? (value as number) : 1 });
  };

  const handleResetFilters = () => {
    resetFilters();
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Top Header & Search Bar */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3" />
              <span>Certified Stock</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Certified Pre-Owned Inventory
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Explore {totalCount} verified luxury and premium cars with transparent fixed pricing.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Mobile Filter Sheet Button */}
            <div className="lg:hidden">
              <FiltersSheet
                filters={filterState}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                availableBrands={availableBrands}
                totalResults={totalCount}
              />
            </div>

            {/* Sort Dropdown */}
            <SortDropdown
              value={filterState.sort}
              onChange={(newSort) => handleFilterChange("sort", newSort)}
            />
          </div>
        </div>

        {/* Global Search Bar */}
        <SearchBar
          initialValue={filterState.search}
          onSearch={(query) => handleFilterChange("search", query)}
        />

        {/* Active Filter Chips Bar */}
        {(filterState.brand ||
          filterState.bodyType ||
          filterState.fuelType ||
          filterState.transmission ||
          filterState.search ||
          filterState.showSold) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-muted-foreground">Active:</span>
            {filterState.brand && (
              <Badge variant="secondary" className="gap-1 text-xs py-1">
                <span>Brand: {filterState.brand}</span>
                <button
                  onClick={() => handleFilterChange("brand", "")}
                  className="hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {filterState.bodyType && (
              <Badge variant="secondary" className="gap-1 text-xs py-1">
                <span>Type: {filterState.bodyType}</span>
                <button
                  onClick={() => handleFilterChange("bodyType", "")}
                  className="hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {filterState.fuelType && (
              <Badge variant="secondary" className="gap-1 text-xs py-1">
                <span>Fuel: {filterState.fuelType}</span>
                <button
                  onClick={() => handleFilterChange("fuelType", "")}
                  className="hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {filterState.transmission && (
              <Badge variant="secondary" className="gap-1 text-xs py-1">
                <span>Gearbox: {filterState.transmission}</span>
                <button
                  onClick={() => handleFilterChange("transmission", "")}
                  className="hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {filterState.search && (
              <Badge variant="secondary" className="gap-1 text-xs py-1">
                <span>Search: &ldquo;{filterState.search}&rdquo;</span>
                <button
                  onClick={() => handleFilterChange("search", "")}
                  className="hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {filterState.showSold && (
              <Badge variant="destructive" className="gap-1 text-xs py-1">
                <span>Including Sold</span>
                <button
                  onClick={() => handleFilterChange("showSold", false)}
                  className="hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Main Layout: Desktop Sidebar (Left) + Cars Grid (Right) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Desktop Sidebar (1 Column) */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-24 self-start">
          <FiltersSidebar
            filters={filterState}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            availableBrands={availableBrands}
            totalResults={totalCount}
          />
        </aside>

        {/* Cars Grid & Pagination (3 Columns) */}
        <main className="lg:col-span-3 space-y-6">
          {isPending ? (
            <CarsSkeleton count={itemsPerPage} />
          ) : (
            <CarGrid cars={initialCars} onResetFilters={handleResetFilters} />
          )}

          {/* Pagination */}
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => handleFilterChange("page", page)}
          />
        </main>
      </div>
    </div>
  );
}
