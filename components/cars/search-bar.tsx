"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  initialValue = "",
  onSearch,
  placeholder = "Search by brand, model (e.g. BMW 330i, Polo GT, Creta)...",
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full items-center">
      <Search className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-11 pl-10 pr-20 text-sm bg-card rounded-xl border-border shadow-xs focus-visible:ring-primary"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-12 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
      <Button
        type="submit"
        size="sm"
        className="absolute right-1.5 h-8 px-3 text-xs font-semibold rounded-lg"
      >
        Search
      </Button>
    </form>
  );
}
