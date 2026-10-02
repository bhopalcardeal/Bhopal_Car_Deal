import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { Button } from "@/components/ui/button";
import {
  Car,
  BadgePercent,
  Users,
  MessageSquare,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Phone,
  CheckCircle,
  Clock,
} from "lucide-react";
import { formatPriceINR } from "@/lib/utils/formatters";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Real Prisma queries for real counts
  const [
    liveCarsCount,
    soldThisMonthCount,
    newSellerLeadsCount,
    newBuyerEnquiriesCount,
    carsByStatusRaw,
    enquiriesBySourceRaw,
    recentLeads,
    recentEnquiries,
  ] = await Promise.all([
    // 1. Total Live Listings
    prisma.carListing.count({ where: { status: "LIVE" } }),

    // 2. Cars Sold this month (or total SOLD if within month)
    prisma.carListing.count({
      where: {
        status: "SOLD",
        updatedAt: { gte: startOfMonth },
      },
    }),

    // 3. New Seller Leads
    prisma.sellerLead.count({ where: { status: "NEW" } }),

    // 4. New Buyer Enquiries
    prisma.buyerEnquiry.count({ where: { status: "NEW" } }),

    // 5. Group cars by status
    prisma.carListing.groupBy({
      by: ["status"],
      _count: { id: true },
    }),

    // 6. Group customer enquiries by source
    prisma.buyerEnquiry.groupBy({
      by: ["source"],
      _count: { id: true },
    }),

    // 7. Recent seller leads
    prisma.sellerLead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),

    // 8. Recent buyer enquiries with relatedCar
    prisma.buyerEnquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        relatedCar: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  // Format Status Chart Data with automotive colors
  const statusColorMap: Record<string, string> = {
    LIVE: "#10b981", // Emerald green
    RESERVED: "#f59e0b", // Amber
    SOLD: "#6366f1", // Indigo
    DRAFT: "#64748b", // Slate
    ARCHIVED: "#94a3b8", // Light slate
  };

  const statusData = carsByStatusRaw.map((item) => ({
    name: item.status,
    count: item._count.id,
    color: statusColorMap[item.status] || "#e11d48",
  }));

  // Format Leads by Source Data
  const sourceData = enquiriesBySourceRaw.map((item) => ({
    source: item.source.replace("_", " "),
    count: item._count.id,
  }));

  // Fallback defaults if database has zero group rows
  if (statusData.length === 0) {
    statusData.push({ name: "LIVE", count: liveCarsCount, color: "#10b981" });
  }
  if (sourceData.length === 0) {
    sourceData.push({ source: "WEBSITE", count: newBuyerEnquiriesCount || 1 });
  }

  const KPIS = [
    {
      title: "Total Live Listings",
      value: liveCarsCount,
      subtitle: "Verified pre-owned inventory",
      icon: Car,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
    },
    {
      title: "Cars Sold This Month",
      value: soldThisMonthCount,
      subtitle: "Completed showroom deliveries",
      icon: BadgePercent,
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-200",
    },
    {
      title: "New Seller Leads",
      value: newSellerLeadsCount,
      subtitle: "Awaiting car evaluation & quote",
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
    },
    {
      title: "New Buyer Enquiries",
      value: newBuyerEnquiriesCount,
      subtitle: "Test drives & price quotes",
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
    },
  ];

  return (
    <div className="space-y-8 text-slate-900">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"
        />

        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
            <Sparkles className="size-3.5 text-primary" />
            <span>Showroom Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Bhopal Car Deal Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Live operations, certified inventory metrics, customer leads, and sales breakdown.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <Button asChild className="bg-primary hover:bg-rose-600 text-white font-bold gap-2 shadow-md shadow-primary/25">
            <Link href="/admin/inventory/new">
              <PlusCircle className="size-4" />
              <span>Add Vehicle</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100">
            <Link href="/admin/inventory">
              <span>View Inventory ({liveCarsCount})</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Core Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">{kpi.title}</span>
                <div className={`size-10 rounded-xl border flex items-center justify-center ${kpi.bg}`}>
                  <Icon className={`size-5 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">{kpi.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Basic Charts (Recharts) */}
      <DashboardCharts statusData={statusData} sourceData={sourceData} />

      {/* Recent Activity: Seller Leads & Buyer Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Seller Leads */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <span>Recent Seller Leads</span>
              </h3>
              <p className="text-xs text-slate-500">Incoming &ldquo;Sell Your Car&rdquo; requests</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-primary hover:text-rose-700">
              <Link href="/admin/leads">
                <span>View All</span>
                <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {recentLeads.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No seller leads recorded yet.</p>
            ) : (
              recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex items-center justify-between text-xs hover:bg-slate-100/80 transition-colors"
                >
                  <div className="space-y-1 overflow-hidden">
                    <p className="font-bold text-slate-900 truncate">
                      {lead.brand} {lead.modelName} ({lead.manufacturingYear})
                    </p>
                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span>{lead.name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="size-3 text-primary" />
                        {lead.mobileNumber}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <span className="text-primary font-bold block">
                      {lead.expectedPrice ? formatPriceINR(lead.expectedPrice) : "Open"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <Clock className="size-3" />
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Buyer Enquiries */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="size-4 text-emerald-600" />
                <span>Recent Customer Enquiries</span>
              </h3>
              <p className="text-xs text-slate-500">Incoming buyer interest & test-drive requests</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-emerald-700 hover:text-emerald-800">
              <Link href="/admin/enquiries">
                <span>View All</span>
                <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {recentEnquiries.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No buyer enquiries recorded yet.</p>
            ) : (
              recentEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex items-center justify-between text-xs hover:bg-slate-100/80 transition-colors"
                >
                  <div className="space-y-1 overflow-hidden">
                    <p className="font-bold text-slate-900 truncate">
                      {enq.relatedCar?.title ?? "General Showroom Enquiry"}
                    </p>
                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span>{enq.name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="size-3 text-emerald-600" />
                        {enq.phone}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle className="size-2.5" />
                      {enq.source.replace("_", " ")}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">
                      {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
