"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SellerLead, LeadStatus, CarListing } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters";

interface LeadDetailClientProps {
  lead: SellerLead & {
    assignedTo?: { id: string; name: string; email: string } | null;
  };
  convertedCar?: CarListing | null;
}

const STATUS_STEPS: { status: LeadStatus; label: string; desc: string }[] = [
  { status: "NEW", label: "New Lead", desc: "Received from seller" },
  { status: "CONTACTED", label: "Contacted", desc: "First phone/WA call" },
  { status: "INSPECTION_SCHEDULED", label: "Inspection", desc: "Doorstep/workshop check" },
  { status: "EVALUATED_OFFER_MADE", label: "Offer Made", desc: "Valuation offered" },
  { status: "PURCHASED", label: "Purchased", desc: "Acquired into showroom" },
  { status: "REJECTED", label: "Rejected / Closed", desc: "Deal not finalized" },
];

export function LeadDetailClient({ lead: initialLead, convertedCar }: LeadDetailClientProps) {
  const router = useRouter();
  const [lead, setLead] = useState(initialLead);
  const [status, setStatus] = useState<LeadStatus>(initialLead.status);
  const [internalNotes, setInternalNotes] = useState(initialLead.internalNotes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [converting, setConverting] = useState(false);

  // Status Change Handler
  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (newStatus === status) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const data = await res.json();
      setStatus(newStatus);
      setLead(data.lead);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Save Notes Handler
  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes }),
      });

      if (!res.ok) throw new Error("Failed to save notes");

      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save inspection notes");
    } finally {
      setSavingNotes(false);
    }
  };

  // Convert to Listing Handler
  const handleConvert = async () => {
    setConverting(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/convert`, {
        method: "POST",
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to convert lead to inventory listing");
      }

      const data = await res.json();
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Conversion error");
      setConverting(false);
    }
  };

  const whatsappUrl = `https://wa.me/91${lead.mobileNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi ${lead.name}, regarding your ${lead.manufacturingYear} ${lead.brand} ${lead.modelName} listed with Bhopal Car Deal for ₹${(lead.expectedPrice / 100000).toFixed(2)} Lakh, we are following up on your inspection.`
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
            <Link href="/admin/leads">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                Seller Lead: {lead.name}
              </h1>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-xs">
                {lead.city}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Received on {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {lead.convertedCarId ? (
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
            >
              <Link href={`/admin/inventory/${lead.convertedCarId}/edit`}>
                <CheckCircle2 className="size-4" />
                <span>View Converted Listing</span>
              </Link>
            </Button>
          ) : (
            <Button
              onClick={handleConvert}
              disabled={converting}
              className="bg-primary hover:bg-rose-600 text-white font-bold text-xs gap-1.5 shadow-md shadow-primary/25 cursor-pointer"
            >
              {converting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span>Convert to Inventory Listing</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Conversion Banner if already converted */}
      {convertedCar && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Car className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold">
                Converted into Inventory Stock
              </p>
              <p className="text-xs text-emerald-700">
                Active in dealership database as: <strong>{convertedCar.title}</strong> (Status: {convertedCar.status})
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 shrink-0 font-bold"
          >
            <Link href={`/admin/inventory/${convertedCar.id}/edit`}>
              Open in Inventory Editor
              <ExternalLink className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Workflow Stepper Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Lead Progression Workflow
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

      {/* Main Grid: Seller Contact + Vehicle Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Seller & Valuation */}
        <div className="lg:col-span-4 space-y-6">
          {/* Seller Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User className="size-4 text-primary" />
              Seller Contact Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{lead.name}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">City / Location</span>
                <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3.5 text-primary" />
                  {lead.city}, {lead.registrationState}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Primary Phone</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  +91 {lead.mobileNumber}
                </span>
              </div>

              {lead.whatsappNumber && (
                <div>
                  <span className="text-slate-400 block text-[11px]">WhatsApp Number</span>
                  <span className="font-mono font-bold text-emerald-700">
                    +91 {lead.whatsappNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Action Triggers */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Button
                asChild
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="size-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold gap-2"
              >
                <a href={`tel:+91${lead.mobileNumber}`}>
                  <Phone className="size-4 text-primary" />
                  <span>Direct Call Seller</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Pricing & Valuation Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              Valuation & Expectations
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">
                Seller Asking Price
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {formatCurrency(lead.expectedPrice)}
              </div>
              <span className="text-xs text-primary font-bold">
                ₹{(lead.expectedPrice / 100000).toFixed(2)} Lakh
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Vehicle Technical Evaluation */}
        <div className="lg:col-span-8 space-y-6">
          {/* Vehicle Specifications Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Car className="size-4 text-primary" />
                Vehicle Specifications
              </h3>
              <span className="bg-rose-50 text-rose-700 font-mono font-bold px-2.5 py-1 rounded-lg border border-rose-200 text-xs flex items-center gap-1.5">
                <Lock className="size-3 text-rose-600" />
                {lead.registrationNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">Brand</span>
                <p className="font-bold text-slate-900">{lead.brand}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">Model</span>
                <p className="font-bold text-slate-900">{lead.modelName}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">Variant</span>
                <p className="font-bold text-slate-900">{lead.variant || "Standard"}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">Mfg Year</span>
                <p className="font-bold text-slate-900">{lead.manufacturingYear}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">Reg Year</span>
                <p className="font-bold text-slate-900">{lead.registrationYear}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">RTO State</span>
                <p className="font-bold text-slate-900">{lead.registrationState}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">Ownership Tier</span>
                <p className="font-bold text-slate-900">{lead.ownerType} Owner</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">Kilometers Range</span>
                <p className="font-bold text-slate-900">{lead.kmDrivenRange}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">Fuel Type</span>
                <p className="font-bold text-slate-900">{lead.fuelType}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">Transmission</span>
                <p className="font-bold text-slate-900">{lead.transmissionType}</p>
              </div>
            </div>

            {/* Photos Strip */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">
                Seller Uploaded Photos ({lead.photos.length})
              </span>
              {lead.photos.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                  No photos uploaded by seller yet. Photos can be captured and added during physical inspection.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {lead.photos.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                    >
                      <Image
                        src={url}
                        alt={`Seller Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Internal Inspection Notes Editor Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Staff Inspection Remarks & Offer Notes
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Private internal remarks for dealership technicians and evaluators. Never shared with seller.
                </p>
              </div>

              <Button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold gap-1.5 cursor-pointer"
              >
                {savingNotes ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : notesSaved ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    <span>Save Notes</span>
                  </>
                )}
              </Button>
            </div>

            <textarea
              rows={4}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g. Engine smooth, suspension verified on test drive, minor bumper scratch on left rear, final offer made ₹6,20,000. Seller willing to close by Friday."
              className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 p-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-400 shadow-2xs leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
