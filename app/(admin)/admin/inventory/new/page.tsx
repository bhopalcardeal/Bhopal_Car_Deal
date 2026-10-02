import React from "react";
import { CarForm } from "@/components/admin/car-form";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Add New Car | Bhopal Car Deal Admin",
};

export default function NewCarPage() {
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
        <span className="text-slate-900 font-semibold">Add New Car</span>
      </nav>

      {/* Main Form */}
      <CarForm mode="create" />
    </div>
  );
}
