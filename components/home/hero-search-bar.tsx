"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const POPULAR_MAKES = [
  "Toyota",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Hyundai",
  "Tata",
  "Mahindra",
  "Kia",
  "Porsche",
  "Honda",
  "Volkswagen",
  "Maruti Suzuki",
];

const MODELS_BY_MAKE: Record<string, string[]> = {
  Toyota: ["Fortuner", "Innova Crysta", "Camry", "Urban Cruiser", "Glanza", "Hilux"],
  BMW: ["3 Series", "5 Series", "X1", "X3", "X5", "M340i", "7 Series"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLA", "GLC", "GLE", "S-Class"],
  Audi: ["A4", "A6", "Q3", "Q5", "Q7"],
  Hyundai: ["Creta", "Tucson", "Venue", "Verna", "Alcazar", "i20"],
  Tata: ["Harrier", "Safari", "Nexon", "Punch", "Altroz"],
  Mahindra: ["XUV700", "Thar", "Scorpio-N", "Scorpio Classic", "XUV300"],
  Kia: ["Seltos", "Carnival", "Sonet", "Carens", "EV6"],
  Porsche: ["Macan", "Cayenne", "Panamera", "911"],
  Honda: ["City", "Civic", "Amaze", "Elevate"],
  Volkswagen: ["Virtus", "Taigun", "Tiguan", "Polo"],
  "Maruti Suzuki": ["Grand Vitara", "Brezza", "Baleno", "Swift", "Ciaz", "Ertiga"],
};

const DEFAULT_POPULAR_MODELS = [
  "Fortuner",
  "Innova Crysta",
  "3 Series",
  "5 Series",
  "C-Class",
  "E-Class",
  "Q5",
  "Creta",
  "Harrier",
  "XUV700",
  "Thar",
  "Macan",
];

const BUDGET_OPTIONS = [
  { label: "Under ₹10 Lakh", value: "0-1000000" },
  { label: "₹10 Lakh - ₹20 Lakh", value: "1000000-2000000" },
  { label: "₹20 Lakh - ₹35 Lakh", value: "2000000-3500000" },
  { label: "₹35 Lakh - ₹50 Lakh", value: "3500000-5000000" },
  { label: "Above ₹50 Lakh", value: "5000000-max" },
];

export function HeroSearchBar() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedBudget, setSelectedBudget] = useState<string>("");

  const availableModels =
    selectedMake && selectedMake !== "all" && MODELS_BY_MAKE[selectedMake]
      ? MODELS_BY_MAKE[selectedMake]
      : DEFAULT_POPULAR_MODELS;

  const handleMakeChange = (value: string) => {
    setSelectedMake(value === "all" ? "" : value);
    setSelectedModel("");
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value === "all" ? "" : value);
  };

  const handleBudgetChange = (value: string) => {
    setSelectedBudget(value === "all" ? "" : value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(() => {
      const params = new URLSearchParams();

      if (selectedMake && selectedMake !== "all") {
        params.set("brand", selectedMake);
      }

      if (selectedModel && selectedModel !== "all") {
        params.set("search", selectedModel);
      }

      if (selectedBudget && selectedBudget !== "all") {
        const [min, max] = selectedBudget.split("-");
        if (min && min !== "0") {
          params.set("minPrice", min);
        }
        if (max && max !== "max") {
          params.set("maxPrice", max);
        }
      }

      const queryString = params.toString();
      router.push(`/cars${queryString ? `?${queryString}` : ""}`);
    });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-3xl rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-xl p-2 sm:p-2.5 border border-slate-200/90 shadow-[0_15px_35px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-primary/40 hover:shadow-[0_15px_35px_rgba(225,29,72,0.12)]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-1">
        {/* 1. Make (Any) */}
        <div className="sm:col-span-3 px-1 sm:px-2 sm:border-r border-slate-200">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-2">
            Make
          </label>
          <Select value={selectedMake} onValueChange={handleMakeChange}>
            <SelectTrigger className="h-9 w-full border-0 bg-transparent px-2 py-0 text-sm font-bold text-slate-900 focus:ring-0 focus:ring-offset-0 shadow-none hover:bg-slate-50 rounded-lg [&>span]:text-slate-900 [&>span]:font-semibold">
              <SelectValue placeholder="Make (Any)" />
            </SelectTrigger>
            <SelectContent className="max-h-64 bg-white border-slate-200 text-slate-900 shadow-xl">
              <SelectItem value="all" className="font-medium text-slate-700 focus:bg-primary/10 focus:text-primary">
                Make (Any)
              </SelectItem>
              {POPULAR_MAKES.map((make) => (
                <SelectItem
                  key={make}
                  value={make}
                  className="font-medium text-slate-800 focus:bg-primary/10 focus:text-primary"
                >
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 2. Model (Any) */}
        <div className="sm:col-span-3 px-1 sm:px-2 sm:border-r border-slate-200">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-2">
            Model
          </label>
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger className="h-9 w-full border-0 bg-transparent px-2 py-0 text-sm font-bold text-slate-900 focus:ring-0 focus:ring-offset-0 shadow-none hover:bg-slate-50 rounded-lg [&>span]:text-slate-900 [&>span]:font-semibold">
              <SelectValue placeholder="Model (Any)" />
            </SelectTrigger>
            <SelectContent className="max-h-64 bg-white border-slate-200 text-slate-900 shadow-xl">
              <SelectItem value="all" className="font-medium text-slate-700 focus:bg-primary/10 focus:text-primary">
                Model (Any)
              </SelectItem>
              {availableModels.map((model) => (
                <SelectItem
                  key={model}
                  value={model}
                  className="font-medium text-slate-800 focus:bg-primary/10 focus:text-primary"
                >
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Budget (Any) */}
        <div className="sm:col-span-3 px-1 sm:px-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-2">
            Budget
          </label>
          <Select value={selectedBudget} onValueChange={handleBudgetChange}>
            <SelectTrigger className="h-9 w-full border-0 bg-transparent px-2 py-0 text-sm font-bold text-slate-900 focus:ring-0 focus:ring-offset-0 shadow-none hover:bg-slate-50 rounded-lg [&>span]:text-slate-900 [&>span]:font-semibold">
              <SelectValue placeholder="Budget (Any)" />
            </SelectTrigger>
            <SelectContent className="max-h-64 bg-white border-slate-200 text-slate-900 shadow-xl">
              <SelectItem value="all" className="font-medium text-slate-700 focus:bg-primary/10 focus:text-primary">
                Budget (Any)
              </SelectItem>
              {BUDGET_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="font-medium text-slate-800 focus:bg-primary/10 focus:text-primary"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4. Crimson Red Search Button */}
        <div className="sm:col-span-3 flex justify-end pl-1 sm:pl-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto min-w-[125px] h-11 sm:h-10 rounded-xl sm:rounded-full bg-primary hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-primary/30 transition-all hover:scale-102 active:scale-98 gap-2 cursor-pointer"
          >
            <Search className="size-4 stroke-[2.5]" />
            <span>{isPending ? "Searching..." : "Search"}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
