"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BuyerEnquiry, EnquiryStatus, EnquirySource } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Check,
  ChevronLeft,
  Clock,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  User,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatKm } from "@/lib/utils/formatters";

interface EnquiryDetailClientProps {
  enquiry: BuyerEnquiry & {
    relatedCar?: {
      id: string;
      title: string;
      slug: string;
      brand: string;
      model: string;
      variant: string;
      manufacturingYear: number;
      price: number;
      discountedPrice?: number | null;
      coverImage: string;
      kmDriven: number;
      fuelType: string;
      transmission: string;
      status: string;
    } | null;
  };
}

const STATUS_STEPS: { status: EnquiryStatus; label: string; desc: string }[] = [
  { status: "NEW", label: "New Lead", desc: "Just received" },
  { status: "CONTACTED", label: "Contacted", desc: "Customer called/messaged" },
  { status: "TEST_DRIVE_SCHEDULED", label: "Test Drive", desc: "Showroom visit planned" },
  { status: "NEGOTIATION", label: "Negotiation", desc: "Pricing discussed" },
  { status: "WON_SOLD", label: "Won / Sold", desc: "Car delivered" },
  { status: "LOST", label: "Lost / Closed", desc: "Customer backed out" },
];

const SOURCE_LABELS: Record<EnquirySource, string> = {
  CAR_DETAIL: "Vehicle Detail Page",
  HOME_PAGE: "Homepage Showcase",
  CONTACT_PAGE: "Contact Us Form",
  DIRECT_CALL: "Direct Showroom Call",
};

export function EnquiryDetailClient({ enquiry: initialEnquiry }: EnquiryDetailClientProps) {
  const router = useRouter();
  const [enquiry, setEnquiry] = useState(initialEnquiry);
  const [status, setStatus] = useState<EnquiryStatus>(initialEnquiry.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Status Change Handler
  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    if (newStatus === status) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const data = await res.json();
      setStatus(newStatus);
      setEnquiry(data.enquiry);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update enquiry status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const whatsappUrl = `https://wa.me/91${enquiry.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi ${enquiry.name}, thank you for contacting Bhopal Car Deal regarding ${
      enquiry.relatedCar ? enquiry.relatedCar.title : "our pre-owned cars"
    }. When would be a convenient time for a test drive at our Motia Talab showroom?`
  )}`;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            asChild
            className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <Link href="/admin/enquiries">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                Buyer Enquiry: {enquiry.name}
              </h1>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-xs">
                {SOURCE_LABELS[enquiry.source] || enquiry.source}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Received on {new Date(enquiry.createdAt).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2.5">
          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageSquare className="size-4" />
              <span>WhatsApp Buyer</span>
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold gap-1.5 shadow-xs"
          >
            <a href={`tel:+91${enquiry.phone}`}>
              <Phone className="size-4 text-primary" />
              <span>Call Now</span>
            </a>
          </Button>
        </div>
      </div>

      {/* Workflow Stepper Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Deal Progression Workflow
          </h2>
          {updatingStatus && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Loader2 className="size-3 animate-spin text-primary" />
              Saving status...
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {STATUS_STEPS.map((s, idx) => {
            const isCurrent = status === s.status;
            return (
              <button
                key={s.status}
                type="button"
                onClick={() => handleStatusChange(s.status)}
                disabled={updatingStatus}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[78px]",
                  isCurrent
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={cn("text-[10px] font-mono", isCurrent ? "text-rose-200 font-bold" : "text-slate-400")}>
                    0{idx + 1}
                  </span>
                  {isCurrent && <Check className="size-3 text-white" />}
                </div>
                <div>
                  <div className={cn("text-xs font-bold", isCurrent ? "text-white" : "text-slate-900")}>
                    {s.label}
                  </div>
                  <div className={cn("text-[10px] line-clamp-1", isCurrent ? "text-rose-100" : "text-slate-500")}>
                    {s.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Buyer Profile + Linked Car */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Buyer Profile */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User className="size-4 text-primary" />
              Buyer Contact Details
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Customer Name</span>
                <span className="font-bold text-slate-900 text-base">{enquiry.name}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Mobile Phone</span>
                <a
                  href={`tel:+91${enquiry.phone}`}
                  className="font-mono font-bold text-slate-900 text-sm hover:text-primary transition-colors flex items-center gap-1.5 mt-0.5"
                >
                  <Phone className="size-3.5 text-primary" />
                  +91 {enquiry.phone}
                </a>
              </div>

              {enquiry.email && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="font-medium text-slate-700 hover:text-primary transition-colors flex items-center gap-1.5 mt-0.5"
                  >
                    <Mail className="size-3.5 text-slate-400" />
                    {enquiry.email}
                  </a>
                </div>
              )}

              <div>
                <span className="text-slate-400 block text-[11px]">Enquiry Source</span>
                <span className="font-semibold text-slate-800">
                  {SOURCE_LABELS[enquiry.source] || enquiry.source}
                </span>
              </div>
            </div>

            {/* Buyer Message */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <span className="text-slate-500 font-semibold text-xs block">
                Buyer Notes / Message:
              </span>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed italic">
                {enquiry.message ? `"${enquiry.message}"` : "No specific comments entered by buyer."}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inquired Vehicle Showcase */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Car className="size-4 text-primary" />
              Requested Vehicle Information
            </h3>

            {enquiry.relatedCar ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative w-full sm:w-48 aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    <Image
                      src={enquiry.relatedCar.coverImage || "/images/hero-red-car.jpg"}
                      alt={enquiry.relatedCar.title || "Vehicle"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-100 text-slate-700 text-xs">
                        {enquiry.relatedCar.brand}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-xs font-bold",
                          enquiry.relatedCar.status === "LIVE" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                          enquiry.relatedCar.status === "SOLD" && "bg-purple-50 text-purple-700 border-purple-200",
                          enquiry.relatedCar.status === "RESERVED" && "bg-amber-50 text-amber-700 border-amber-200",
                          enquiry.relatedCar.status === "DRAFT" && "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                      >
                        {enquiry.relatedCar.status}
                      </Badge>
                    </div>

                    <h4 className="font-black text-slate-900 text-lg leading-snug">
                      {enquiry.relatedCar.title}
                    </h4>

                    <div className="flex items-baseline gap-2 font-mono">
                      <span className="text-xl font-bold text-slate-900">
                        {formatCurrency(enquiry.relatedCar.discountedPrice ?? enquiry.relatedCar.price)}
                      </span>
                      {enquiry.relatedCar.discountedPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatCurrency(enquiry.relatedCar.price)}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                      {enquiry.relatedCar.manufacturingYear && (
                        <span>{enquiry.relatedCar.manufacturingYear} Model</span>
                      )}
                      {enquiry.relatedCar.kmDriven !== undefined && (
                        <>
                          <span>•</span>
                          <span>{formatKm(enquiry.relatedCar.kmDriven)}</span>
                        </>
                      )}
                      {enquiry.relatedCar.fuelType && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{enquiry.relatedCar.fuelType.toLowerCase()}</span>
                        </>
                      )}
                      {enquiry.relatedCar.transmission && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{enquiry.relatedCar.transmission.toLowerCase()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Action Links */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                  {enquiry.relatedCar.slug && (
                    <Button asChild size="sm" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 font-semibold text-xs">
                      <Link href={`/cars/${enquiry.relatedCar.slug}`} target="_blank">
                        <span>View Public Storefront Page</span>
                        <ExternalLink className="size-3 text-slate-400" />
                      </Link>
                    </Button>
                  )}

                  {enquiry.relatedCar.id && (
                    <Button asChild size="sm" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 font-semibold text-xs">
                      <Link href={`/admin/inventory/${enquiry.relatedCar.id}/edit`}>
                        <span>Edit in Admin Inventory</span>
                        <ExternalLink className="size-3 text-slate-400" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center space-y-2 text-slate-500">
                <Car className="size-8 mx-auto text-slate-300" />
                <p className="font-semibold text-sm text-slate-700">General Showroom Callback</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  The customer submitted a general callback inquiry without selecting a specific car.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
