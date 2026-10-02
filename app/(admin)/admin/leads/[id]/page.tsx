import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { LeadDetailClient } from "@/components/admin/lead-detail-client";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Seller Lead Dossier | Bhopal Car Deal Admin",
};

export const dynamic = "force-dynamic";

interface LeadPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminLeadDetailPage({ params }: LeadPageProps) {
  const { id } = await params;

  const lead = await prisma.sellerLead.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!lead) {
    notFound();
  }

  // If already converted, fetch the car listing
  let convertedCar = null;
  if (lead.convertedCarId) {
    convertedCar = await prisma.carListing.findUnique({
      where: { id: lead.convertedCarId },
    });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">
          Admin
        </Link>
        <ChevronRight className="size-3 text-slate-400" />
        <Link href="/admin/leads" className="hover:text-slate-900 transition-colors">
          Seller Leads
        </Link>
        <ChevronRight className="size-3 text-slate-400" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">
          {lead.name} ({lead.brand} {lead.modelName})
        </span>
      </nav>

      {/* Main Dossier Client */}
      <LeadDetailClient lead={lead} convertedCar={convertedCar} />
    </div>
  );
}
