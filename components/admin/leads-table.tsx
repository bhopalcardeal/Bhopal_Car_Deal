"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SellerLead, LeadStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Car,
  Download,
  Eye,
  Loader2,
  Lock,
  MessageSquare,
  MoreVertical,
  Phone,
  PlusCircle,
  Search,
  Sparkles,
  Trash2,
  X,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters";
import { downloadCsvInBrowser, generateCsv, CsvColumn } from "@/lib/utils/csv";

export type SellerLeadWithAssignee = SellerLead & {
  assignedTo?: { id: string; name: string; email: string } | null;
};

interface LeadsTableProps {
  initialLeads: SellerLeadWithAssignee[];
}

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; badgeClass: string; step: number }
> = {
  NEW: {
    label: "New Lead",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    step: 1,
  },
  CONTACTED: {
    label: "Contacted",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    step: 2,
  },
  INSPECTION_SCHEDULED: {
    label: "Inspection Scheduled",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    step: 3,
  },
  EVALUATED_OFFER_MADE: {
    label: "Offer Made",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    step: 4,
  },
  PURCHASED: {
    label: "Purchased",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    step: 5,
  },
  REJECTED: {
    label: "Rejected / Closed",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    step: 6,
  },
};

export function LeadsTable({ initialLeads }: LeadsTableProps) {
  const router = useRouter();
  const [leads, setLeads] = useState<SellerLeadWithAssignee[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<SellerLeadWithAssignee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (statusFilter !== "ALL" && lead.status !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = (lead.name || "").toLowerCase().includes(q);
        const matchMobile = (lead.mobileNumber || "").includes(q);
        const matchCity = (lead.city || "").toLowerCase().includes(q);
        const matchBrand = (lead.brand || "").toLowerCase().includes(q);
        const matchModel = (lead.modelName || "").toLowerCase().includes(q);
        const matchPlate = (lead.registrationNumber || "").toLowerCase().includes(q);
        return matchName || matchMobile || matchCity || matchBrand || matchModel || matchPlate;
      }
      return true;
    });
  }, [leads, statusFilter, search]);

  // Status counts
  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: leads.length };
    leads.forEach((l) => {
      map[l.status] = (map[l.status] || 0) + 1;
    });
    return map;
  }, [leads]);

  // Update Status Handler
  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    setStatusUpdatingId(leadId);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Convert to Inventory Listing Handler
  const handleConvert = async (leadId: string) => {
    setConvertingId(leadId);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/convert`, {
        method: "POST",
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to convert lead to car listing");
      }

      const data = await res.json();
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Error converting lead");
      setConvertingId(null);
    }
  };

  // Delete Lead Handler
  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete lead");

      setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
      setDeleteModalOpen(false);
      setLeadToDelete(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete lead");
    } finally {
      setIsDeleting(false);
    }
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const columns: CsvColumn<SellerLeadWithAssignee>[] = [
      { header: "Lead ID", key: "id" },
      {
        header: "Date",
        key: (row) => new Date(row.createdAt).toLocaleDateString("en-IN"),
      },
      { header: "Seller Name", key: "name" },
      { header: "Mobile", key: "mobileNumber" },
      { header: "WhatsApp", key: (row) => row.whatsappNumber || "" },
      { header: "City", key: "city" },
      { header: "Brand", key: "brand" },
      { header: "Model", key: "modelName" },
      { header: "Variant", key: (row) => row.variant || "" },
      { header: "Year", key: "manufacturingYear" },
      { header: "Plate", key: "registrationNumber" },
      { header: "Km Range", key: "kmDrivenRange" },
      { header: "Fuel", key: "fuelType" },
      { header: "Transmission", key: "transmissionType" },
      { header: "Expected Price (INR)", key: "expectedPrice" },
      { header: "Status", key: "status" },
      { header: "Notes", key: (row) => row.internalNotes || "" },
      { header: "Converted Car ID", key: (row) => row.convertedCarId || "" },
    ];

    const csvData = generateCsv(columns, filteredLeads);
    downloadCsvInBrowser(`seller-leads-${statusFilter.toLowerCase()}-${new Date().toISOString().split("T")[0]}`, csvData);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Tabs & Actions Bar */}
      <div className="flex flex-col gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              statusFilter === "ALL"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            All Leads ({counts.ALL || 0})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = counts[key] || 0;
            const isSelected = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & CSV Export Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              placeholder="Search by seller, mobile, model, city, plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 rounded-xl focus-visible:ring-primary"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 gap-2 h-9 rounded-xl font-semibold cursor-pointer shadow-xs"
            >
              <Download className="size-4 text-primary" />
              <span>Export CSV ({filteredLeads.length})</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Seller & Location</th>
                <th className="py-3.5 px-4">Direct Contact</th>
                <th className="py-3.5 px-4">Vehicle Specs</th>
                <th className="py-3.5 px-4">Expected Price</th>
                <th className="py-3.5 px-4">Workflow Status</th>
                <th className="py-3.5 px-4">Conversion</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Car className="size-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm">No seller leads found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting your search or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const statusInfo = STATUS_CONFIG[lead.status];
                  const whatsappUrl = `https://wa.me/91${lead.mobileNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hi ${lead.name}, thank you for contacting Bhopal Car Deal regarding selling your ${lead.manufacturingYear} ${lead.brand} ${lead.modelName}. We would like to discuss evaluation.`
                  )}`;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Seller & Location */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="font-bold text-slate-900 hover:text-primary transition-colors block text-sm"
                        >
                          {lead.name}
                        </Link>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {lead.city}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-900">
                          <Phone className="size-3 text-slate-400 shrink-0" />
                          <span>+91 {lead.mobileNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            <MessageSquare className="size-3" />
                            <span>WhatsApp</span>
                          </a>
                          <span className="text-slate-300">•</span>
                          <a
                            href={`tel:+91${lead.mobileNumber}`}
                            className="text-[11px] text-slate-500 hover:text-slate-900"
                          >
                            Call
                          </a>
                        </div>
                      </td>

                      {/* Vehicle Specs */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {lead.manufacturingYear} {lead.brand} {lead.modelName}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                            {lead.fuelType}
                          </span>
                          <span>•</span>
                          <span>{lead.kmDrivenRange}</span>
                          <span>•</span>
                          <span className="bg-rose-50 text-rose-700 font-mono font-bold px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-0.5">
                            <Lock className="size-2.5" />
                            {lead.registrationNumber}
                          </span>
                        </div>
                      </td>

                      {/* Expected Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(lead.expectedPrice)}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          ₹{(lead.expectedPrice / 100000).toFixed(2)} Lakh
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              disabled={statusUpdatingId === lead.id}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
                                statusInfo.badgeClass,
                                statusUpdatingId === lead.id && "opacity-50"
                              )}
                            >
                              {statusUpdatingId === lead.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : null}
                              <span>{statusInfo.label}</span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="bg-white border-slate-200 text-slate-900 shadow-xl">
                            <DropdownMenuLabel className="text-xs text-slate-500">
                              Advance Status:
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map((st) => (
                              <DropdownMenuItem
                                key={st}
                                onClick={() => handleUpdateStatus(lead.id, st)}
                                className={cn(
                                  "cursor-pointer text-xs font-medium py-1.5",
                                  lead.status === st && "bg-slate-100 font-bold"
                                )}
                              >
                                <span>{STATUS_CONFIG[st].label}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>

                      {/* Conversion */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {lead.convertedCarId ? (
                          <Link
                            href={`/admin/inventory/${lead.convertedCarId}/edit`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle2 className="size-3 text-emerald-600" />
                            <span>In Inventory (Edit)</span>
                          </Link>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={convertingId === lead.id}
                            onClick={() => handleConvert(lead.id)}
                            className="h-7 text-[11px] border-slate-200 text-slate-700 hover:text-primary hover:bg-rose-50 font-bold gap-1 cursor-pointer"
                          >
                            {convertingId === lead.id ? (
                              <>
                                <Loader2 className="size-3 animate-spin" />
                                <span>Converting...</span>
                              </>
                            ) : (
                              <>
                                <PlusCircle className="size-3 text-primary" />
                                <span>Convert to Car</span>
                              </>
                            )}
                          </Button>
                        )}
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-900 shadow-xl">
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link href={`/admin/leads/${lead.id}`}>
                                <Eye className="size-3.5 mr-2 text-slate-500" />
                                <span>View Full Dossier</span>
                              </Link>
                            </DropdownMenuItem>
                            {!lead.convertedCarId && (
                              <DropdownMenuItem
                                onClick={() => handleConvert(lead.id)}
                                className="cursor-pointer text-primary font-medium"
                              >
                                <Sparkles className="size-3.5 mr-2 text-primary" />
                                <span>Convert to Inventory</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem
                              onClick={() => {
                                setLeadToDelete(lead);
                                setDeleteModalOpen(true);
                              }}
                              className="cursor-pointer text-rose-600 focus:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="size-3.5 mr-2" />
                              <span>Delete Lead</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-white border border-slate-200 text-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Delete Seller Lead</DialogTitle>
            <DialogDescription className="text-slate-500">
              Are you sure you want to delete the seller lead for{" "}
              <strong className="text-slate-900 font-semibold">{leadToDelete?.name}</strong> (
              {leadToDelete?.brand} {leadToDelete?.modelName})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Lead"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
