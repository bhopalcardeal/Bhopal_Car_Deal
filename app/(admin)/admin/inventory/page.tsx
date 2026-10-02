import React from "react";
import { prisma } from "@/lib/db";
import { InventoryTable } from "@/components/admin/inventory-table";

export const metadata = {
  title: "Inventory Management | Bhopal Car Deal Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  try {
    const cars = await prisma.carListing.findMany({
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return <InventoryTable initialCars={cars} />;
  } catch (error) {
    console.error("[AdminInventoryPage] Failed to fetch inventory:", error);
    return <InventoryTable initialCars={[]} />;
  }
}
