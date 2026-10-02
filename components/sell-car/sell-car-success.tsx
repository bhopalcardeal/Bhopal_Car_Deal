"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSellCarStore } from "@/lib/store/use-sell-car-store";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Copy,
  Check,
  CalendarClock,
  Car,
  MessageSquare,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { formatPriceINR } from "@/lib/utils/formatters";
import { buildWhatsAppUrl } from "@/lib/config/contact";

export function SellCarSuccess() {
  const { formData, submittedLeadRef, resetForm } = useSellCarStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (submittedLeadRef) {
      navigator.clipboard.writeText(submittedLeadRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const ownerLabel =
    formData.ownerType === "FIRST"
      ? "1st Owner"
      : formData.ownerType === "SECOND"
      ? "2nd Owner"
      : formData.ownerType === "THIRD"
      ? "3rd Owner"
      : "4+ Owners";

  const carTitle = `${formData.manufacturingYear} ${formData.brand} ${formData.modelName}${
    formData.variant ? ` ${formData.variant}` : ""
  }`;

  const regYearText =
    formData.registrationYear && formData.registrationYear !== formData.manufacturingYear
      ? ` | Reg Year: ${formData.registrationYear}`
      : "";

  const fuelText =
    formData.fuelType === "PETROL"
      ? "Petrol"
      : formData.fuelType === "DIESEL"
      ? "Diesel"
      : formData.fuelType === "CNG"
      ? "CNG"
      : formData.fuelType === "ELECTRIC"
      ? "Electric"
      : "Hybrid";

  const transText = formData.transmissionType === "AUTOMATIC" ? "Automatic" : "Manual";

  const waNumberText =
    !formData.whatsappSame && formData.whatsappNumber
      ? formData.whatsappNumber
      : formData.mobileNumber;

  const photoCountText =
    formData.photos && formData.photos.length > 0
      ? `${formData.photos.length} Photo${formData.photos.length > 1 ? "s" : ""} Attached`
      : "Will provide at doorstep inspection";

  const priceLakhText = `₹${(formData.expectedPrice / 100000).toFixed(2)} Lakh`;

  const whatsappMessage = `*🚗 CAR VALUATION REQUEST — BHOPAL CAR DEAL*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Lead Reference ID:* ${submittedLeadRef || "NEW"}

👤 *SELLER INFORMATION*
• *Full Name:* ${formData.name}
• *Mobile Phone:* ${formData.mobileNumber}
• *WhatsApp Number:* ${waNumberText}
• *Inspection Location:* ${formData.city}

🚘 *VEHICLE SPECIFICATIONS*
• *Car:* ${carTitle}
• *Make Year:* ${formData.manufacturingYear}${regYearText}
• *RC / Plate No:* ${formData.registrationNumber || "Applied / In Process"}
• *RTO State:* ${formData.registrationState || "MP"}
• *Ownership:* ${ownerLabel}
• *Odometer (KM Driven):* ${formData.kmDrivenRange || "N/A"}
• *Fuel Type:* ${fuelText}
• *Transmission:* ${transText}

💰 *VALUATION & ASKING PRICE*
• *Expected Asking Price:* ${formatPriceINR(formData.expectedPrice)} (${priceLakhText})
• *Car Photos:* ${photoCountText}

━━━━━━━━━━━━━━━━━━━━━━━━━━
Please update me on my inspection schedule and final evaluation offer.`;

  return (
    <div className="space-y-8 text-center sm:text-left animate-in fade-in zoom-in-95 duration-300">
      {/* Success Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-100">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
          <CheckCircle2 className="size-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-300">
            Valuation Request Successfully Booked!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-700/90 dark:text-emerald-300/80">
            Our luxury evaluation desk has received your request. An expert will reach out to{" "}
            <span className="font-semibold text-emerald-900 dark:text-white">{formData.name}</span> ({formData.mobileNumber}) shortly.
          </p>
        </div>
      </div>

      {/* Reference Card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              Lead Reference Number
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg sm:text-xl font-mono font-bold text-primary">
                {submittedLeadRef || "SEL-89A02F"}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
              >
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              Expected Asking Price
            </span>
            <p className="text-lg sm:text-xl font-bold text-foreground">
              {formatPriceINR(formData.expectedPrice)}
            </p>
          </div>
        </div>

        {/* Vehicle Specs Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-lg bg-muted/40 p-2.5">
            <span className="text-muted-foreground block text-[11px]">Vehicle</span>
            <span className="font-semibold text-foreground">
              {formData.manufacturingYear} {formData.brand} {formData.modelName}
            </span>
          </div>

          <div className="rounded-lg bg-muted/40 p-2.5">
            <span className="text-muted-foreground block text-[11px]">Registration Plate</span>
            <span className="font-mono font-semibold text-foreground">
              {formData.registrationNumber || "Applied"} ({formData.registrationState})
            </span>
          </div>

          <div className="rounded-lg bg-muted/40 p-2.5">
            <span className="text-muted-foreground block text-[11px]">Odometer & Fuel</span>
            <span className="font-semibold text-foreground">
              {formData.kmDrivenRange} • {formData.fuelType}
            </span>
          </div>

          <div className="rounded-lg bg-muted/40 p-2.5">
            <span className="text-muted-foreground block text-[11px]">Inspection Location</span>
            <span className="font-semibold text-foreground">
              {formData.city}
            </span>
          </div>
        </div>
      </div>

      {/* 3-Step Process Roadmap */}
      <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-4 text-left">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <CalendarClock className="size-4 text-primary" />
          <span>What Happens Next</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1 rounded-xl bg-card border border-border/70 p-3.5">
            <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                1
              </span>
              <span>Doorstep Inspection</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Our certified vehicle specialist schedules a free 150-point physical checkup at your home or office.
            </p>
          </div>

          <div className="space-y-1 rounded-xl bg-card border border-border/70 p-3.5">
            <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                2
              </span>
              <span>Guaranteed Final Offer</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Receive an upfront, transparent dealership purchase offer with zero hidden deductions or commissions.
            </p>
          </div>

          <div className="space-y-1 rounded-xl bg-card border border-border/70 p-3.5">
            <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                3
              </span>
              <span>Instant Payment & RC Transfer</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Immediate IMPS/RTGS bank transfer before the car leaves your driveway. We take care of 100% RC paperwork.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a
          href={buildWhatsAppUrl(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <MessageSquare className="size-4" />
          <span>Priority Chat on WhatsApp</span>
        </a>

        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-xs sm:text-sm font-semibold">
          <Link href="/cars">
            <Car className="size-4" />
            <span>Browse Certified Cars</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={resetForm}
          className="w-full sm:w-auto gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-4" />
          <span>Evaluate Another Car</span>
        </Button>
      </div>
    </div>
  );
}
