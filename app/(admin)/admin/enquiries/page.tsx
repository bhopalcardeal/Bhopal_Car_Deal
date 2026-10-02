import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { EnquiriesTable } from "@/components/admin/enquiries-table";
import { ChevronRight, MessageSquare, Car } from "lucide-react";

export const metadata = {
  title: "Buyer Enquiries Management | Bhopal Car Deal Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.buyerEnquiry.findMany({
    include: {
      relatedCar: {
        select: {
          id: true,
          title: true,
          slug: true,
          brand: true,
          price: true,
          discountedPrice: true,
          coverImage: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalEnquiries = enquiries.length;
  const newEnquiries = enquiries.filter((e) => e.status === "NEW").length;
  const testDrives = enquiries.filter((e) => e.status === "TEST_DRIVE_SCHEDULED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">
          Admin
        </Link>
        <ChevronRight className="size-3 text-slate-400" />
        <span className="text-slate-900 font-semibold">Buyer Enquiries</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <MessageSquare className="size-6 text-primary" />
              Buyer Enquiries & Test Drives
            </h1>
            <span className="rounded-md bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 text-xs font-bold">
              {totalEnquiries} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage inbound buyer leads, test drive requests, price negotiations, and connect directly with customers via WhatsApp or phone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="size-2 rounded-full bg-sky-500" />
            <span className="font-semibold text-slate-700">
              {newEnquiries} New
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Car className="size-3.5 text-amber-600" />
            <span className="font-semibold text-slate-700">
              {testDrives} Test Drives
            </span>
          </div>
        </div>
      </div>

      {/* Datagrid */}
      <EnquiriesTable initialEnquiries={enquiries} />
    </div>
  );
}
