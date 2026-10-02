"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BuyerEnquiry, EnquiryStatus, EnquirySource } from "@prisma/client";
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
  MessageSquare,
  MoreVertical,
  Phone,
  Search,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters";
import { downloadCsvInBrowser, generateCsv, CsvColumn } from "@/lib/utils/csv";

export type EnquiryWithCar = BuyerEnquiry & {
  relatedCar?: {
    id: string;
    title: string;
    slug: string;
    brand: string;
    price: number;
    discountedPrice?: number | null;
    coverImage: string;
    status: string;
  } | null;
};

interface EnquiriesTableProps {
  initialEnquiries: EnquiryWithCar[];
}

const STATUS_CONFIG: Record<
  EnquiryStatus,
  { label: string; badgeClass: string }
> = {
  NEW: {
    label: "New Enquiry",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  CONTACTED: {
    label: "Contacted",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  TEST_DRIVE_SCHEDULED: {
    label: "Test Drive",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  NEGOTIATION: {
    label: "Negotiation",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  WON_SOLD: {
    label: "Won / Sold",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  LOST: {
    label: "Lost / Closed",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const SOURCE_CONFIG: Record<
  EnquirySource,
  { label: string; badgeClass: string }
> = {
  CAR_DETAIL: { label: "Vehicle Page", badgeClass: "bg-slate-100 text-slate-700" },
  HOME_PAGE: { label: "Homepage", badgeClass: "bg-indigo-50 text-indigo-700" },
  CONTACT_PAGE: { label: "Contact Us", badgeClass: "bg-emerald-50 text-emerald-700" },
  DIRECT_CALL: { label: "Direct Call", badgeClass: "bg-amber-50 text-amber-700" },
};

export function EnquiriesTable({ initialEnquiries }: EnquiriesTableProps) {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<EnquiryWithCar[]>(initialEnquiries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<EnquiryWithCar | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      if (statusFilter !== "ALL" && enq.status !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = (enq.name || "").toLowerCase().includes(q);
        const matchPhone = (enq.phone || "").includes(q);
        const matchEmail = (enq.email || "").toLowerCase().includes(q);
        const matchMsg = (enq.message || "").toLowerCase().includes(q);
        const matchCar = (enq.relatedCar?.title || "").toLowerCase().includes(q);
        return matchName || matchPhone || matchEmail || matchMsg || matchCar;
      }
      return true;
    });
  }, [enquiries, statusFilter, search]);

  // Status counts
  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: enquiries.length };
    enquiries.forEach((e) => {
      map[e.status] = (map[e.status] || 0) + 1;
    });
    return map;
  }, [enquiries]);

  // Update Status Handler
  const handleUpdateStatus = async (enquiryId: string, newStatus: EnquiryStatus) => {
    setUpdatingId(enquiryId);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, status: newStatus } : e))
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Confirm Handler
  const handleDeleteConfirm = async () => {
    if (!enquiryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete enquiry");

      setEnquiries((prev) => prev.filter((e) => e.id !== enquiryToDelete.id));
      setDeleteModalOpen(false);
      setEnquiryToDelete(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete enquiry");
    } finally {
      setIsDeleting(false);
    }
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const columns: CsvColumn<EnquiryWithCar>[] = [
      { header: "Enquiry ID", key: "id" },
      {
        header: "Date",
        key: (row) => new Date(row.createdAt).toLocaleDateString("en-IN"),
      },
      { header: "Buyer Name", key: "name" },
      { header: "Phone", key: "phone" },
      { header: "Email", key: (row) => row.email || "" },
      { header: "Source", key: "source" },
      { header: "Status", key: "status" },
      { header: "Car Title", key: (row) => row.relatedCar?.title || "General Inquiry" },
      { header: "Car Brand", key: (row) => row.relatedCar?.brand || "" },
      { header: "Car Price (INR)", key: (row) => (row.relatedCar?.price ? String(row.relatedCar.price) : "") },
      { header: "Buyer Message", key: (row) => row.message || "" },
    ];

    const csvData = generateCsv(columns, filteredEnquiries);
    downloadCsvInBrowser(`buyer-enquiries-${statusFilter.toLowerCase()}-${new Date().toISOString().split("T")[0]}`, csvData);
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs & Search Controls */}
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
            All Enquiries ({counts.ALL || 0})
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

        {/* Search & Export */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              placeholder="Search by buyer, phone, car title, message..."
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
              <span>Export CSV ({filteredEnquiries.length})</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Enquiries Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Buyer Contact</th>
                <th className="py-3.5 px-4">Inquired Vehicle</th>
                <th className="py-3.5 px-4">Source & Message</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <MessageSquare className="size-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm">No buyer enquiries found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try selecting another status tab or clear your search.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => {
                  const statusInfo = STATUS_CONFIG[enq.status];
                  const sourceInfo = SOURCE_CONFIG[enq.source] || {
                    label: enq.source,
                    badgeClass: "bg-slate-100 text-slate-700",
                  };

                  const whatsappUrl = `https://wa.me/91${enq.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hi ${enq.name}, thank you for contacting Bhopal Car Deal regarding ${
                      enq.relatedCar ? enq.relatedCar.title : "our certified pre-owned cars"
                    }. We would be delighted to assist you.`
                  )}`;

                  return (
                    <tr
                      key={enq.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Buyer Contact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Link
                          href={`/admin/enquiries/${enq.id}`}
                          className="font-bold text-slate-900 hover:text-primary transition-colors block text-sm"
                        >
                          {enq.name}
                        </Link>
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 mt-0.5">
                          <Phone className="size-3 text-slate-400 shrink-0" />
                          <span>+91 {enq.phone}</span>
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
                            href={`tel:+91${enq.phone}`}
                            className="text-[11px] text-slate-500 hover:text-slate-900"
                          >
                            Call
                          </a>
                        </div>
                      </td>

                      {/* Inquired Vehicle */}
                      <td className="py-3.5 px-4">
                        {enq.relatedCar ? (
                          <div className="flex items-center gap-2.5">
                            <div className="relative size-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                              <Image
                                src={enq.relatedCar.coverImage}
                                alt={enq.relatedCar.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <Link
                                href={`/cars/${enq.relatedCar.slug}`}
                                target="_blank"
                                className="font-bold text-slate-900 hover:text-primary transition-colors line-clamp-1 flex items-center gap-1"
                              >
                                <span>{enq.relatedCar.title}</span>
                                <ExternalLink className="size-3 text-slate-400 shrink-0" />
                              </Link>
                              <span className="font-mono font-bold text-primary text-[11px]">
                                {formatCurrency(enq.relatedCar.discountedPrice ?? enq.relatedCar.price)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium">
                            <Car className="size-3 text-slate-400" />
                            General Showroom Callback
                          </span>
                        )}
                      </td>

                      {/* Source & Message */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", sourceInfo.badgeClass)}>
                          {sourceInfo.label}
                        </span>
                        {enq.message ? (
                          <p className="text-slate-600 text-[11px] mt-1 line-clamp-2 italic">
                            &quot;{enq.message}&quot;
                          </p>
                        ) : (
                          <span className="text-slate-400 text-[10px] block mt-0.5">
                            No custom message provided
                          </span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              disabled={updatingId === enq.id}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
                                statusInfo.badgeClass,
                                updatingId === enq.id && "opacity-50"
                              )}
                            >
                              {updatingId === enq.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : null}
                              <span>{statusInfo.label}</span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="bg-white border-slate-200 text-slate-900 shadow-xl">
                            <DropdownMenuLabel className="text-xs text-slate-500">
                              Update Enquiry Status:
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            {(Object.keys(STATUS_CONFIG) as EnquiryStatus[]).map((st) => (
                              <DropdownMenuItem
                                key={st}
                                onClick={() => handleUpdateStatus(enq.id, st)}
                                className={cn(
                                  "cursor-pointer text-xs font-medium py-1.5",
                                  enq.status === st && "bg-slate-100 font-bold"
                                )}
                              >
                                <span>{STATUS_CONFIG[st].label}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                              <Link href={`/admin/enquiries/${enq.id}`}>
                                <Eye className="size-3.5 mr-2 text-slate-500" />
                                <span>View Full Details</span>
                              </Link>
                            </DropdownMenuItem>
                            {enq.relatedCar && (
                              <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/admin/inventory/${enq.relatedCar.id}/edit`}>
                                  <Car className="size-3.5 mr-2 text-slate-500" />
                                  <span>Edit Inquired Car</span>
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem
                              onClick={() => {
                                setEnquiryToDelete(enq);
                                setDeleteModalOpen(true);
                              }}
                              className="cursor-pointer text-rose-600 focus:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="size-3.5 mr-2" />
                              <span>Delete Enquiry</span>
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
            <DialogTitle className="text-slate-900">Delete Buyer Enquiry</DialogTitle>
            <DialogDescription className="text-slate-500">
              Are you sure you want to delete the enquiry from{" "}
              <strong className="text-slate-900 font-semibold">{enquiryToDelete?.name}</strong>? This action cannot be undone.
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
                "Delete Enquiry"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
