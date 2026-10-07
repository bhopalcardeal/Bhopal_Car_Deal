"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Phone,
  CalendarCheck,
  CheckCircle2,
  Car,
} from "lucide-react";
import { formatPriceINR } from "@/lib/utils/formatters";

import { buildWhatsAppUrl, getWhatsAppNumber } from "@/lib/config/contact";

interface EnquiryModalProps {
  carId: string;
  carTitle: string;
  carPrice: number;
  triggerVariant?: "default" | "outline";
  triggerText?: string;
}

export function EnquiryModal({
  carId,
  carTitle,
  carPrice,
  triggerVariant = "default",
  triggerText = "Book a Test Drive",
}: EnquiryModalProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedWhatsAppUrl, setSubmittedWhatsAppUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    preferredDate: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || undefined,
          message: formData.message,
          preferredDate: formData.preferredDate || undefined,
          relatedCarId: carId,
          source: "CAR_DETAIL",
        }),
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data.error || "Failed to submit enquiry.");
        return;
      }

      setSubmitted(true);

      // Automated WhatsApp Client Redirect (Option D)
      if (data.whatsappUrl) {
        setSubmittedWhatsAppUrl(data.whatsappUrl);
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
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        setSubmitError("Request timed out. Please check your connection or contact our showroom directly.");
      } else {
        setSubmitError("Failed to connect to server. Please call us.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappUrl = buildWhatsAppUrl(
    `Hi Bhopal Car Deal, I am interested in the ${carTitle} listed on your showroom.`
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setSubmitted(false);
      }}
    >
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="lg" className="w-full gap-2 font-bold shadow-sm">
          <CalendarCheck className="size-4" />
          <span>{triggerText}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md sm:rounded-2xl p-6">
        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold">Booking Request Received!</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Our luxury car specialist will call you at{" "}
                <span className="font-semibold text-foreground">{formData.phone}</span> within 15 minutes to confirm your test drive.
              </DialogDescription>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-left space-y-1">
              <p className="font-semibold text-foreground">{carTitle}</p>
              <p className="text-muted-foreground">ID: {carId}</p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button asChild variant="outline" className="gap-2 w-full text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                <a href={submittedWhatsAppUrl || whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="size-4" />
                  <span>Connect Instantly on WhatsApp</span>
                </a>
              </Button>
              <Button onClick={() => setOpen(false)} className="w-full">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="text-xl font-bold">Book Showroom Test Drive</DialogTitle>
              <DialogDescription className="text-xs">
                Experience the vehicle firsthand with a sanitized showroom test drive.
              </DialogDescription>
            </DialogHeader>

            {/* Target Car Pill */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Car className="size-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-foreground truncate">{carTitle}</p>
                <p className="text-[11px] text-muted-foreground">{formatPriceINR(carPrice)} • Fixed Price</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="enquiry-name" className="text-xs font-semibold">Full Name *</Label>
                <Input
                  id="enquiry-name"
                  required
                  placeholder="e.g. Vikramaditya Verma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="enquiry-phone" className="text-xs font-semibold">Mobile (WhatsApp) *</Label>
                <Input
                  id="enquiry-phone"
                  type="tel"
                  required
                  placeholder="+91 98112 34567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="enquiry-email" className="text-xs font-semibold">Email Address (Optional)</Label>
                <Input
                  id="enquiry-email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="enquiry-date" className="text-xs font-semibold">Preferred Test Drive Date</Label>
                <Input
                  id="enquiry-date"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                />
              </div>

              {submitError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                  {submitError}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-bold pt-2.5 pb-2.5 h-10 gap-2"
              >
                <CalendarCheck className="size-4" />
                <span>{isSubmitting ? "Submitting..." : "Confirm Test Drive Request"}</span>
              </Button>
            </form>

            <div className="border-t border-border/80 pt-3 flex items-center justify-between text-xs text-muted-foreground">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                <MessageSquare className="size-3.5 text-emerald-500" />
                <span>Chat on WhatsApp</span>
              </a>
              <span className="text-border">•</span>
              <a href={`tel:+${getWhatsAppNumber()}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Phone className="size-3.5 text-primary" />
                <span>Call Showroom</span>
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
