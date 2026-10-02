import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { LeadsTable } from "@/components/admin/leads-table";
import { ChevronRight, Users, Sparkles } from "lucide-react";

export const metadata = {
  title: "Seller Leads Management | Bhopal Car Deal Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.sellerLead.findMany({
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "NEW").length;
  const convertedLeads = leads.filter((l) => !!l.convertedCarId).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">
          Admin
        </Link>
        <ChevronRight className="size-3 text-slate-400" />
        <span className="text-slate-900 font-semibold">Seller Leads</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <Users className="size-6 text-primary" />
              Seller Leads & Inspections
            </h1>
            <span className="rounded-md bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 text-xs font-bold">
              {totalLeads} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review customer vehicle valuation requests, schedule doorstep physical inspections, update notes, and convert leads into verified inventory listings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="size-2 rounded-full bg-sky-500" />
            <span className="font-semibold text-slate-700">
              {newLeads} New
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Sparkles className="size-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-700">
              {convertedLeads} Converted to Stock
            </span>
          </div>
        </div>
      </div>

      {/* Datagrid */}
      <LeadsTable initialLeads={leads} />
    </div>
  );
}
