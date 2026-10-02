import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { EnquiryDetailClient } from "@/components/admin/enquiry-detail-client";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Buyer Enquiry Details | Bhopal Car Deal Admin",
};

export const dynamic = "force-dynamic";

interface EnquiryPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEnquiryDetailPage({ params }: EnquiryPageProps) {
  const { id } = await params;

  const enquiry = await prisma.buyerEnquiry.findUnique({
    where: { id },
    include: {
      relatedCar: {
        select: {
          id: true,
          title: true,
          slug: true,
          brand: true,
          model: true,
          variant: true,
          manufacturingYear: true,
          price: true,
          discountedPrice: true,
          coverImage: true,
          kmDriven: true,
          fuelType: true,
          transmission: true,
          status: true,
        },
      },
    },
  });

  if (!enquiry) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">
          Admin
        </Link>
        <ChevronRight className="size-3 text-slate-400" />
        <Link href="/admin/enquiries" className="hover:text-slate-900 transition-colors">
          Buyer Enquiries
        </Link>
        <ChevronRight className="size-3 text-slate-400" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">
          {enquiry.name} {enquiry.relatedCar ? `(${enquiry.relatedCar.title})` : ""}
        </span>
      </nav>

      {/* Main Dossier Client */}
      <EnquiryDetailClient enquiry={enquiry} />
    </div>
  );
}
