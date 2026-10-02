import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { CarForm } from "@/components/admin/car-form";

export const metadata = {
  title: "Edit Car Listing | Bhopal Car Deal Admin",
};

export const dynamic = "force-dynamic";

interface EditCarPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCarPage({ params }: EditCarPageProps) {
  const { id } = await params;

  const car = await prisma.carListing.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!car) {
    notFound();
  }

  // Format initial data for form
  const initialData = {
    ...car,
    insuranceValidTill: car.insuranceValidTill
      ? car.insuranceValidTill.toISOString().split("T")[0]
      : null,
    images: car.images.map((img) => ({
      url: img.url,
      isCover: img.isCover,
    })),
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">
          Admin
        </Link>
        <ChevronRight className="size-3 text-slate-400" />
        <Link href="/admin/inventory" className="hover:text-slate-900 transition-colors">
          Inventory
        </Link>
        <ChevronRight className="size-3 text-slate-400" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">
          Edit {car.title}
        </span>
      </nav>

      {/* Main Form */}
      <CarForm mode="edit" initialData={initialData} />
    </div>
  );
}
