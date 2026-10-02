"use client";

import React, { useState, useMemo } from "react";
import { useSellCarStore } from "@/lib/store/use-sell-car-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  X,
  AlertCircle,
  Loader2,
  BadgeIndianRupee,
  ShieldCheck,
} from "lucide-react";
import { formatPriceINR } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

// Helper function to calculate a realistic dynamic estimate range
function calculateEstimatedRange(
  brand: string,
  year: number,
  kmRange: string
): { min: number; max: number } {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - year);

  // Baseline brand multiplier
  const luxuryBrands = ["BMW", "Mercedes-Benz", "Audi", "Land Rover", "Porsche", "Volvo", "Jaguar"];
  const premiumBrands = ["Toyota", "Volkswagen", "Skoda", "Honda", "Kia", "Hyundai", "Mahindra", "Tata"];

  let basePrice = 800000;
  if (luxuryBrands.some((b) => brand.toLowerCase().includes(b.toLowerCase()))) {
    basePrice = 3500000;
  } else if (premiumBrands.some((b) => brand.toLowerCase().includes(b.toLowerCase()))) {
    basePrice = 1200000;
  }

  // Depreciation ~10% per year
  const depreciationFactor = Math.pow(0.9, age);

  // Mileage factor based on exact km or range
  let kmFactor = 1.0;
  const numbers = kmRange.replace(/,/g, "").match(/\d+/g);
  let kmValue = 35000;
  if (numbers && numbers.length > 0) {
    const parsed = parseInt(numbers[0] || "35000", 10);
    if (!isNaN(parsed) && parsed > 0) kmValue = parsed;
  }
  if (kmValue < 20000) kmFactor = 1.05;
  else if (kmValue > 100000) kmFactor = 0.75;
  else if (kmValue > 70000) kmFactor = 0.85;
  else if (kmValue > 40000) kmFactor = 0.92;

  const estimatedMid = Math.round(basePrice * depreciationFactor * kmFactor);
  const min = Math.round((estimatedMid * 0.92) / 10000) * 10000;
  const max = Math.round((estimatedMid * 1.08) / 10000) * 10000;

  return { min: Math.max(min, 150000), max: Math.max(max, 200000) };
}

export function StepValuation() {
  const {
    formData,
    updateFormData,
    prevStep,
    setSuccess,
    isSubmitting,
    setIsSubmitting,
    submitError,
    setSubmitError,
  } = useSellCarStore();

  const estimate = useMemo(
    () =>
      calculateEstimatedRange(
        formData.brand || "Sedan",
        formData.manufacturingYear || 2021,
        formData.kmDrivenRange || "20,000 - 40,000 km"
      ),
    [formData.brand, formData.manufacturingYear, formData.kmDrivenRange]
  );

  const initialEstimatedPrice = useMemo(
    () => Math.round((estimate.min + estimate.max) / 20000) * 10000,
    [estimate.min, estimate.max]
  );

  const [expectedPrice, setExpectedPrice] = useState<number>(() => {
    if (formData.expectedPrice && formData.expectedPrice > 0 && formData.expectedPrice !== 750000) {
      return formData.expectedPrice;
    }
    return Math.round((estimate.min + estimate.max) / 20000) * 10000;
  });

  // Keep store in sync with estimated default if not explicitly entered
  React.useEffect(() => {
    if (!formData.expectedPrice || formData.expectedPrice === 0 || formData.expectedPrice === 750000) {
      const mid = Math.round((estimate.min + estimate.max) / 20000) * 10000;
      setExpectedPrice(mid);
      updateFormData({ expectedPrice: mid });
    }
  }, [estimate.min, estimate.max, formData.expectedPrice, updateFormData]);

  const handlePriceChange = (val: number) => {
    setExpectedPrice(val);
    updateFormData({ expectedPrice: val });
  };

  const [selectedPhotos, setSelectedPhotos] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [honeypot, setHoneypot] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Revoke object URLs on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      selectedPhotos.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, [selectedPhotos]);

  // Select local files with instant zero-lag preview
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (selectedPhotos.length + files.length > 6) {
      setPhotoError("You can upload a maximum of 6 photos.");
      return;
    }

    setPhotoError(null);

    const newItems = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedPhotos((prev) => [...prev, ...newItems].slice(0, 6));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (id: string) => {
    setSelectedPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  // Submit car details + files in a single atomic request to /api/leads
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitError(null);

    if (!expectedPrice || expectedPrice < 50000 || expectedPrice > 100000000) {
      setLocalError("Please enter a realistic expected price between ₹50,000 and ₹10 Crore");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataPayload = new FormData();
      formDataPayload.append("name", formData.name);
      formDataPayload.append("mobileNumber", formData.mobileNumber);
      formDataPayload.append("whatsappSame", String(formData.whatsappSame));
      formDataPayload.append("whatsappNumber", formData.whatsappNumber || "");
      formDataPayload.append("city", formData.city || "Bhopal");
      formDataPayload.append("registrationNumber", formData.registrationNumber);
      formDataPayload.append("registrationState", formData.registrationState || "MP");
      formDataPayload.append("manufacturingYear", String(formData.manufacturingYear || 2021));
      formDataPayload.append("registrationYear", String(formData.registrationYear || 2021));
      formDataPayload.append("ownerType", formData.ownerType || "FIRST");
      formDataPayload.append("brand", formData.brand);
      formDataPayload.append("modelName", formData.modelName);
      formDataPayload.append("variant", formData.variant || "");
      formDataPayload.append("kmDrivenRange", formData.kmDrivenRange || "35,000 km");
      formDataPayload.append("fuelType", formData.fuelType || "PETROL");
      formDataPayload.append("transmissionType", formData.transmissionType || "MANUAL");
      formDataPayload.append("expectedPrice", String(expectedPrice));
      formDataPayload.append("hp_website", honeypot);

      // Append binary files for server-side Cloudinary upload
      selectedPhotos.forEach((item) => {
        formDataPayload.append("files", item.file);
      });

      const res = await fetch("/api/leads", {
        method: "POST",
        body: formDataPayload,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to submit your car details. Please try again.");
      }

      // Update store with final user-entered expectedPrice & Cloudinary URLs returned from server
      updateFormData({
        expectedPrice,
        ...(data.photos && Array.isArray(data.photos) ? { photos: data.photos } : {}),
      });

      // Cleanup local preview URLs
      selectedPhotos.forEach((p) => URL.revokeObjectURL(p.preview));

      // Transition to success screen
      setSuccess(data.leadId, data.leadRef);

      // Automated WhatsApp Client Redirect (Option D)
      if (data.whatsappUrl) {
        let newTab: Window | null = null;
        try {
          newTab = window.open(data.whatsappUrl, "_blank");
        } catch {
          newTab = null;
        }

        // If new tab was blocked by browser popup blocker, redirect directly in current window
        if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
          window.location.href = data.whatsappUrl;
        }
      }
    } catch (err: unknown) {
      console.error("Submission error:", err);
      const msg = err instanceof Error ? err.message : "Failed to submit. Please check your connection.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Instant Valuation & Expected Price
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Review our data-backed market valuation and set your desired asking price.
        </p>
      </div>

      {/* Dynamic Valuation Estimation Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
          <Sparkles className="size-4 animate-pulse" />
          <span>AI Dealership Market Appraisal</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Estimated Fair Market Value for</p>
            <p className="text-sm font-bold text-foreground">
              {formData.manufacturingYear} {formData.brand} {formData.modelName}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xl sm:text-2xl font-black text-primary tracking-tight">
              {formatPriceINR(estimate.min)} - {formatPriceINR(estimate.max)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Expected Asking Price */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="expected-price" className="text-xs font-semibold flex items-center gap-1.5">
              <BadgeIndianRupee className="size-3.5 text-primary" />
              <span>Your Expected Selling Price (₹) <span className="text-destructive">*</span></span>
            </Label>
            <span className="text-xs font-bold text-primary">
              {formatPriceINR(Number(expectedPrice))}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm font-bold text-muted-foreground">₹</span>
            <Input
              id="expected-price"
              type="number"
              min={50000}
              max={100000000}
              step={10000}
              placeholder={String(initialEstimatedPrice)}
              value={expectedPrice || ""}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className="pl-8 text-base font-bold"
              autoFocus
            />
          </div>

          {/* Quick Price Increment Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground mr-1">Quick presets:</span>
            {[estimate.min, initialEstimatedPrice, estimate.max].map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => handlePriceChange(p)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                  expectedPrice === p
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-border/80 bg-card text-foreground hover:border-primary hover:text-primary"
                )}
              >
                {formatPriceINR(p)}
              </button>
            ))}
          </div>

          {localError && <p className="text-xs text-destructive">{localError}</p>}
        </div>

        {/* Optional Photos Upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">
              Car Photos (Optional, up to 6)
            </Label>
            <span className="text-[11px] text-muted-foreground">{selectedPhotos.length}/6 selected</span>
          </div>

          {/* Upload Drop Area */}
          <div
            onClick={() => !isSubmitting && fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/60 bg-muted/20 p-6 text-center transition-colors cursor-pointer",
              isSubmitting && "pointer-events-none opacity-80"
            )}
          >
            <UploadCloud className="size-8 text-muted-foreground mb-2" />
            <p className="text-xs font-medium text-foreground">
              Click to browse or drag & drop car photos
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Front view, odometer, dashboard, exterior angles (JPEG, PNG, WebP up to 6 photos)
            </p>
            {/* <p className="text-[10px] text-primary/80 font-medium mt-1">
              ☁ Photos will be uploaded to Cloudinary automatically upon clicking &quot;Get Dealership Offer&quot;
            </p> */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif,image/jpg"
              onChange={handlePhotoSelect}
              disabled={isSubmitting}
              className="hidden"
            />
          </div>

          {photoError && (
            <p className="text-xs text-destructive">{photoError}</p>
          )}

          {/* Preview Thumbnails */}
          {selectedPhotos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
              {selectedPhotos.map((item, idx) => (
                <div key={item.id} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-black/10 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.preview}
                    alt={`Selected photo ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                    #{idx + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(item.id)}
                    className="absolute top-1 right-1 rounded-full bg-black/75 p-1 text-white hover:bg-destructive transition-colors cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Hidden Honeypot Input for anti-spam */}
        <input
          type="text"
          name="hp_website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="hidden absolute left-[-9999px]"
          aria-hidden="true"
        />

        {/* Trust Badges */}
        <div className="rounded-xl border border-border bg-card p-3.5 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>The Bhopal Car Deal Selling Guarantee</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              <span>Free Doorstep Inspection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              <span>Instant Bank Wire</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              <span>100% Free RC Transfer</span>
            </div>
          </div>
        </div>

        {/* Server Submission Error Banner */}
        {submitError && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
      </div>

      <div className="pt-4 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isSubmitting}
          className="gap-2 font-medium"
        >
          <ArrowLeft className="size-4" />
          <span>Back</span>
        </Button>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="gap-2 font-bold px-8 shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              <span>Get Dealership Offer</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
