"use client";

import React, { useState } from "react";
import { useSellCarStore } from "@/lib/store/use-sell-car-store";
import { contactStepSchema } from "@/lib/validations/sell-car";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, MapPin, MessageSquare } from "lucide-react";

const POPULAR_CITIES = [
  "Bhopal",
  "Indore",
  "Jabalpur",
  "Gwalior",
  "Ujjain",
  "Sagar",
  "Sehore",
  "Mumbai",
];

export function StepContact() {
  const { formData, updateFormData, nextStep } = useSellCarStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState(formData.name);
  const [mobileNumber, setMobileNumber] = useState(formData.mobileNumber);
  const [whatsappSame, setWhatsappSame] = useState(formData.whatsappSame);
  const [whatsappNumber, setWhatsappNumber] = useState(formData.whatsappNumber || "");
  const [city, setCity] = useState(formData.city);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactStepSchema.safeParse({
      name,
      mobileNumber,
      whatsappSame,
      whatsappNumber: whatsappSame ? undefined : whatsappNumber,
      city,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    updateFormData({
      name,
      mobileNumber,
      whatsappSame,
      whatsappNumber: whatsappSame ? mobileNumber : whatsappNumber,
      city,
    });

    nextStep();
  };

  return (
    <form onSubmit={handleContinue} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Let’s start with your contact details
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          We’ll send instant valuation reports and connect you with our valuation expert.
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="contact-name" className="text-xs font-semibold">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="contact-name"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        {/* Mobile Number */}
        <div className="space-y-1.5">
          <Label htmlFor="contact-mobile" className="text-xs font-semibold">
            Mobile Number (10 digits) <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs font-semibold text-muted-foreground">
              +91
            </span>
            <Input
              id="contact-mobile"
              type="tel"
              maxLength={10}
              placeholder="98112 34567"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
              className="pl-12"
            />
          </div>
          {errors.mobileNumber && (
            <p className="text-xs text-destructive">{errors.mobileNumber}</p>
          )}
        </div>

        {/* WhatsApp Same Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="whatsapp-same"
            checked={whatsappSame}
            onChange={(e) => setWhatsappSame(e.target.checked)}
            className="size-4 rounded border-border accent-primary focus:ring-primary"
          />
          <Label htmlFor="whatsapp-same" className="text-xs font-medium cursor-pointer">
            My WhatsApp number is same as mobile number
          </Label>
        </div>

        {/* WhatsApp Number (if different) */}
        {!whatsappSame && (
          <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
            <Label htmlFor="contact-whatsapp" className="text-xs font-semibold">
              WhatsApp Number <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-2.5 size-4 text-emerald-500" />
              <Input
                id="contact-whatsapp"
                type="tel"
                maxLength={10}
                placeholder="WhatsApp 10 digits"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
                className="pl-9"
              />
            </div>
            {errors.whatsappNumber && (
              <p className="text-xs text-destructive">{errors.whatsappNumber}</p>
            )}
          </div>
        )}

        {/* City Selection */}
        <div className="space-y-2">
          <Label htmlFor="contact-city" className="text-xs font-semibold">
            Your City <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="contact-city"
              placeholder="Select or enter your city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="pl-9"
            />
          </div>
          {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}

          {/* Quick City Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {POPULAR_CITIES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCity(c)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  city === c
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border/70 bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" size="lg" className="w-full sm:w-auto gap-2 font-bold px-8">
          <span>Next: Registration Details</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}
