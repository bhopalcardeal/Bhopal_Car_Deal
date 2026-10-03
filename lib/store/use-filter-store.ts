import { create } from "zustand";

export interface FilterState {
  brand: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  fuelType: string;
  transmission: string;
  maxKm: number;
  registrationState: string;
  bodyType: string;
  search: string;
  sort: string;
  showSold: boolean;
  page: number;
  isPending: boolean;

  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setMultipleFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  initFromParams: (params: Record<string, string | undefined>) => void;
}

const DEFAULT_FILTERS = {
  brand: "",
  minPrice: 0,
  maxPrice: 8000000, // 80 Lakh
  minYear: 2018,
  maxYear: 2024,
  fuelType: "",
  transmission: "",
  maxKm: 100000,
  registrationState: "",
  bodyType: "",
  search: "",
  sort: "recently_added",
  showSold: true,
  page: 1,
  isPending: false,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...DEFAULT_FILTERS,

  setFilter: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
      // Reset page to 1 whenever any filter other than page changes
      page: key === "page" ? (value as number) : 1,
    })),

  setMultipleFilters: (filters) =>
    set((state) => ({
      ...state,
      ...filters,
      page: filters.page !== undefined ? filters.page : 1,
    })),

  resetFilters: () => set({ ...DEFAULT_FILTERS }),

  initFromParams: (params) => {
    set({
      brand: params.brand ?? "",
      minPrice: params.minPrice ? Number(params.minPrice) : DEFAULT_FILTERS.minPrice,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : DEFAULT_FILTERS.maxPrice,
      minYear: params.minYear ? Number(params.minYear) : DEFAULT_FILTERS.minYear,
      maxYear: params.maxYear ? Number(params.maxYear) : DEFAULT_FILTERS.maxYear,
      fuelType: params.fuelType ?? "",
      transmission: params.transmission ?? "",
      maxKm: params.maxKm ? Number(params.maxKm) : DEFAULT_FILTERS.maxKm,
      registrationState: params.registrationState ?? "",
      bodyType: params.bodyType ?? "",
      search: params.search ?? "",
      sort: params.sort ?? "recently_added",
      showSold: params.showSold !== "false",
      page: params.page ? Number(params.page) : 1,
      isPending: false,
    });
  },
}));
