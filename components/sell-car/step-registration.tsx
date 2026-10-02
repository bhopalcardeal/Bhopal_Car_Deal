"use client";

import React, { useState } from "react";
import { useSellCarStore } from "@/lib/store/use-sell-car-store";
import { registrationStepSchema } from "@/lib/validations/sell-car";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ShieldAlert, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const STATES = [
  { code: "MP", name: "Madhya Pradesh (MP)" },
  { code: "DL", name: "Delhi (DL)" },
  { code: "HR", name: "Haryana (HR)" },
  { code: "MH", name: "Maharashtra (MH)" },
  { code: "UP", name: "Uttar Pradesh (UP)" },
  { code: "RJ", name: "Rajasthan (RJ)" },
  { code: "KA", name: "Karnataka (KA)" },
  { code: "GJ", name: "Gujarat (GJ)" },
  { code: "CH", name: "Chandigarh (CH)" },
  { code: "TS", name: "Telangana (TS)" },
];

const OWNER_TYPES = [
  { id: "FIRST", label: "1st Owner" },
  { id: "SECOND", label: "2nd Owner" },
  { id: "THIRD", label: "3rd Owner" },
  { id: "FOURTH_PLUS", label: "4th+ Owner" },
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2005 + 1 }, (_, i) => CURRENT_YEAR - i);

export function StepRegistration() {
  const { formData, updateFormData, nextStep, prevStep } = useSellCarStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [registrationNumber, setRegistrationNumber] = useState(formData.registrationNumber);
  const [registrationState, setRegistrationState] = useState(formData.registrationState);
  const [manufacturingYear, setManufacturingYear] = useState<number>(formData.manufacturingYear);
  const [registrationYear, setRegistrationYear] = useState<number>(formData.registrationYear);
  const [ownerType, setOwnerType] = useState(formData.ownerType);

  // Auto-detect 2-letter state code from plate
  const handlePlateChange = (val: string) => {
    const clean = val.toUpperCase();
    setRegistrationNumber(clean);
    if (clean.length >= 2) {
      const detected = clean.slice(0, 2);
      const match = STATES.find((s) => s.code === detected);
      if (match) {
        setRegistrationState(match.code);
      }
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registrationStepSchema.safeParse({
      registrationNumber,
      registrationState,
      manufacturingYear: Number(manufacturingYear),
      registrationYear: Number(registrationYear),
      ownerType,
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
      registrationNumber: result.data.registrationNumber,
      registrationState: result.data.registrationState,
      manufacturingYear: result.data.manufacturingYear,
      registrationYear: result.data.registrationYear,
      ownerType: result.data.ownerType,
    });

    nextStep();
  };

  return (
    <form onSubmit={handleContinue} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Vehicle Registration & Ownership
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Helps us pull RTO history, road tax validity, and ownership tier for accurate appraisal.
        </p>
      </div>

      <div className="space-y-4">
        {/* Registration Number */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="reg-number" className="text-xs font-semibold">
              Registration Number <span className="text-destructive">*</span>
            </Label>
            <span className="text-[11px] text-muted-foreground">e.g. MP04AB1234</span>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-2.5 flex items-center gap-1 text-xs font-bold text-muted-foreground">
              <span>IND</span>
            </div>
            <Input
              id="reg-number"
              placeholder="MP04 AB 1234"
              value={registrationNumber}
              onChange={(e) => handlePlateChange(e.target.value)}
              className="pl-12 font-mono uppercase text-sm tracking-wider font-semibold"
              maxLength={15}
              autoFocus
            />
          </div>
          {errors.registrationNumber && (
            <p className="text-xs text-destructive">{errors.registrationNumber}</p>
          )}
        </div>

        {/* Registration State */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-state" className="text-xs font-semibold">
            Registration State / RTO <span className="text-destructive">*</span>
          </Label>
          <select
            id="reg-state"
            value={registrationState}
            onChange={(e) => setRegistrationState(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.registrationState && (
            <p className="text-xs text-destructive">{errors.registrationState}</p>
          )}
        </div>

        {/* Manufacturing & Registration Years */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="mfg-year" className="text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>Manufacturing Year</span>
            </Label>
            <select
              id="mfg-year"
              value={manufacturingYear}
              onChange={(e) => {
                const val = Number(e.target.value);
                setManufacturingYear(val);
                if (registrationYear < val) setRegistrationYear(val);
              }}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {errors.manufacturingYear && (
              <p className="text-xs text-destructive">{errors.manufacturingYear}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-year" className="text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>Registration Year</span>
            </Label>
            <select
              id="reg-year"
              value={registrationYear}
              onChange={(e) => setRegistrationYear(Number(e.target.value))}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {errors.registrationYear && (
              <p className="text-xs text-destructive">{errors.registrationYear}</p>
            )}
          </div>
        </div>

        {/* Ownership Type */}
        <div className="space-y-2 pt-1">
          <Label className="text-xs font-semibold">
            Ownership Tier <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {OWNER_TYPES.map((type) => {
              const selected = ownerType === type.id;
              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => setOwnerType(type.id)}
                  className={cn(
                    "flex items-center justify-center rounded-xl border p-2.5 text-xs font-semibold transition-all",
                    selected
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  )}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
          {errors.ownerType && <p className="text-xs text-destructive">{errors.ownerType}</p>}
        </div>

        {/* Privacy reassurance */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
          <ShieldAlert className="size-4 text-primary shrink-0 mt-0.5" />
          <p>
            Your RC registration details are 100% confidential and securely stored. They are never published on the public site or disclosed to buyers.
          </p>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="gap-2 font-medium"
        >
          <ArrowLeft className="size-4" />
          <span>Back</span>
        </Button>
        <Button type="submit" size="lg" className="gap-2 font-bold px-8">
          <span>Next: Car Specs</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}
