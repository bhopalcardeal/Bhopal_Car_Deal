"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline text-xs font-semibold text-muted-foreground whitespace-nowrap">
        Sort By:
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 w-[180px] sm:w-[210px] rounded-xl text-xs sm:text-sm bg-card border-border">
          <div className="flex items-center gap-2 truncate">
            <ArrowUpDown className="size-3.5 text-primary shrink-0" />
            <SelectValue placeholder="Sort cars" />
          </div>
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="recently_added">Recently Added (Newest)</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
          <SelectItem value="year_desc">Year: Newest First</SelectItem>
          <SelectItem value="km_asc">KM: Lowest First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
