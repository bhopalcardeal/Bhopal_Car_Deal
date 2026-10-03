import React from "react";
import type { Metadata } from "next";
import {
  prisma,
  PUBLIC_CAR_SELECT,
} from "@/lib/db";
import {
  CarBodyType,
  FuelType,
  TransmissionType,
  Prisma,
} from "@prisma/client";
import { CarsBrowseClient } from "@/components/cars/cars-browse-client";

export const metadata: Metadata = {
  title: "Explore Certified Pre-Owned Cars | Bhopal Car Deal",
  description:
    "Browse our complete collection of inspected pre-owned cars in Bhopal (M.P.). Filter by brand, price, year, and fuel with verified paperwork and easy finance.",
};

const ITEMS_PER_PAGE = 9;

interface CarsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const resolvedParams = await searchParams;

  // Extract query filters
  const brand = typeof resolvedParams.brand === "string" ? resolvedParams.brand : undefined;
  const bodyType = typeof resolvedParams.bodyType === "string" ? resolvedParams.bodyType : undefined;
  const fuelType = typeof resolvedParams.fuelType === "string" ? resolvedParams.fuelType : undefined;
  const transmission =
    typeof resolvedParams.transmission === "string" ? resolvedParams.transmission : undefined;
  const registrationState =
    typeof resolvedParams.registrationState === "string"
      ? resolvedParams.registrationState
      : undefined;
  const search = typeof resolvedParams.search === "string" ? resolvedParams.search.trim() : undefined;
  const sort = typeof resolvedParams.sort === "string" ? resolvedParams.sort : "recently_added";
  const showSold = resolvedParams.showSold !== "false";
  const page = typeof resolvedParams.page === "string" ? Math.max(1, parseInt(resolvedParams.page, 10)) : 1;

  const minPrice =
    typeof resolvedParams.minPrice === "string" ? parseInt(resolvedParams.minPrice, 10) : undefined;
  const maxPrice =
    typeof resolvedParams.maxPrice === "string" ? parseInt(resolvedParams.maxPrice, 10) : undefined;
  const minYear =
    typeof resolvedParams.minYear === "string" ? parseInt(resolvedParams.minYear, 10) : undefined;
  const maxYear =
    typeof resolvedParams.maxYear === "string" ? parseInt(resolvedParams.maxYear, 10) : undefined;
  const maxKm =
    typeof resolvedParams.maxKm === "string" ? parseInt(resolvedParams.maxKm, 10) : undefined;

  // Construct Prisma WHERE clause
  const where: Prisma.CarListingWhereInput = {
    status: showSold ? { in: ["LIVE", "SOLD"] } : "LIVE",
  };

  if (brand) {
    where.brand = { equals: brand, mode: "insensitive" };
  }

  if (bodyType && Object.values(CarBodyType).includes(bodyType as CarBodyType)) {
    where.bodyType = bodyType as CarBodyType;
  }

  if (fuelType && Object.values(FuelType).includes(fuelType as FuelType)) {
    where.fuelType = fuelType as FuelType;
  }

  if (
    transmission &&
    Object.values(TransmissionType).includes(transmission as TransmissionType)
  ) {
    where.transmission = transmission as TransmissionType;
  }

  if (registrationState) {
    where.registrationState = { equals: registrationState, mode: "insensitive" };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (minYear !== undefined || maxYear !== undefined) {
    where.manufacturingYear = {};
    if (minYear !== undefined) where.manufacturingYear.gte = minYear;
    if (maxYear !== undefined) where.manufacturingYear.lte = maxYear;
  }

  if (maxKm !== undefined) {
    where.kmDriven = { lte: maxKm };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
      { variant: { contains: search, mode: "insensitive" } },
    ];
  }

  // Construct Prisma ORDER BY clause: Live cars first, Sold cars at bottom, then user-selected sort
  let sortOrderBy: Prisma.CarListingOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") {
    sortOrderBy = { price: "asc" };
  } else if (sort === "price_desc") {
    sortOrderBy = { price: "desc" };
  } else if (sort === "year_desc") {
    sortOrderBy = { manufacturingYear: "desc" };
  } else if (sort === "km_asc") {
    sortOrderBy = { kmDriven: "asc" };
  } else {
    sortOrderBy = { createdAt: "desc" };
  }

  const orderBy: Prisma.CarListingOrderByWithRelationInput[] = [
    { status: "asc" }, // "LIVE" precedes "SOLD" alphabetically
    sortOrderBy,
  ];

  // Execute database queries in parallel
  const [cars, totalCount, brandRecords] = await Promise.all([
    prisma.carListing.findMany({
      where,
      select: PUBLIC_CAR_SELECT,
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.carListing.count({ where }),
    prisma.carListing.findMany({
      where: { status: { in: ["LIVE", "SOLD"] } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);

  const availableBrands = brandRecords.map((b) => b.brand);

  return (
    <CarsBrowseClient
      initialCars={cars}
      totalCount={totalCount}
      availableBrands={availableBrands}
      currentPage={page}
      itemsPerPage={ITEMS_PER_PAGE}
    />
  );
}
