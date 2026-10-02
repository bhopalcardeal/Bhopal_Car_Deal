"use client";

import React, { useState } from "react";
import { useSellCarStore } from "@/lib/store/use-sell-car-store";
import { vehicleStepSchema } from "@/lib/validations/sell-car";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Gauge, Fuel, Cog } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_BRANDS = [
  "Maruti Suzuki",
  "Hyundai",
  "Tata",
  "Mahindra",
  "Toyota",
  "Honda",
  "Volkswagen",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Kia",
  "Skoda",
  "Land Rover",
  "Volvo",
];

function parseInitialKm(val?: string): number {
  if (!val) return 35000;
  const numbers = val.replace(/,/g, "").match(/\d+/g);
  if (numbers && numbers.length > 0) {
    const parsed = parseInt(numbers[0] || "0", 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 35000;
}

const KM_PRESETS = [
  { label: "10,000 km", value: 10000 },
  { label: "25,000 km", value: 25000 },
  { label: "45,000 km", value: 45000 },
  { label: "65,000 km", value: 65000 },
  { label: "85,000 km", value: 85000 },
  { label: "1,00,000+ km", value: 100000 },
];

const FUEL_TYPES = [
  { id: "PETROL", label: "Petrol" },
  { id: "DIESEL", label: "Diesel" },
  { id: "CNG", label: "CNG" },
  { id: "ELECTRIC", label: "Electric" },
  { id: "HYBRID", label: "Hybrid" },
] as const;

const TRANSMISSIONS = [
  { id: "MANUAL", label: "Manual" },
  { id: "AUTOMATIC", label: "Automatic" },
] as const;

export function StepVehicle() {
  const { formData, updateFormData, nextStep, prevStep } = useSellCarStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [brand, setBrand] = useState(formData.brand);
  const [customBrand, setCustomBrand] = useState(
    POPULAR_BRANDS.includes(formData.brand) ? "" : formData.brand
  );
  const [modelName, setModelName] = useState(formData.modelName);
  const [variant, setVariant] = useState(formData.variant || "");
  const [exactKm, setExactKm] = useState<number>(() => parseInitialKm(formData.kmDrivenRange));
  const [fuelType, setFuelType] = useState(formData.fuelType);
  const [transmissionType, setTransmissionType] = useState(formData.transmissionType);

  const handleBrandSelect = (b: string) => {
    setBrand(b);
    setCustomBrand("");
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const finalBrand = customBrand.trim() ? customBrand.trim() : brand;

    if (!exactKm || exactKm < 500) {
      setErrors({ kmDrivenRange: "Please enter valid kilometers driven (min 500 km)" });
      return;
    }

    const finalKmStr = `${exactKm.toLocaleString("en-IN")} km`;

    const result = vehicleStepSchema.safeParse({
      brand: finalBrand,
      modelName,
      variant,
      kmDrivenRange: finalKmStr,
      fuelType,
      transmissionType,
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
      brand: result.data.brand,
      modelName: result.data.modelName,
      variant: result.data.variant,
      kmDrivenRange: result.data.kmDrivenRange,
      fuelType: result.data.fuelType,
      transmissionType: result.data.transmissionType,
    });

    nextStep();
  };

  return (
    <form onSubmit={handleContinue} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Car Specifications & Condition
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Tell us about the vehicle make, model, odometer range, and powertrain.
        </p>
      </div>

      <div className="space-y-5">
        {/* Brand Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">
            Vehicle Brand / Make <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_BRANDS.map((b) => {
              const selected = brand === b && !customBrand;
              return (
                <button
                  type="button"
                  key={b}
                  onClick={() => handleBrandSelect(b)}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border/70 bg-card text-foreground hover:bg-muted"
                  )}
                >
                  {b}
                </button>
              );
            })}
          </div>

          <div className="pt-1">
            <Input
              placeholder="Or type brand name if not listed above..."
              value={customBrand}
              onChange={(e) => {
                setCustomBrand(e.target.value);
                setBrand(e.target.value);
              }}
              className="text-xs h-9"
            />
          </div>
          {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
        </div>

        {/* Model & Variant */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="model-name" className="text-xs font-semibold">
              Model Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="model-name"
              placeholder="e.g. 3 Series, Creta, Fortuner, City"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
            {errors.modelName && <p className="text-xs text-destructive">{errors.modelName}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="variant-name" className="text-xs font-semibold">
              Variant / Trim (Optional)
            </Label>
            <Input
              id="variant-name"
              placeholder="e.g. 320d Luxury Line, SX (O), ZX"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
            />
          </div>
        </div>

        {/* Exact Kilometers Driven (Odometer Reading) */}
        <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <Label htmlFor="exactKm" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              <Gauge className="size-4 text-primary" />
              <span>Exact Kilometers Driven <span className="text-destructive">*</span></span>
            </Label>
            <span className="text-xs sm:text-sm font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              {exactKm ? `${exactKm.toLocaleString("en-IN")} km` : "Enter km"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="relative sm:col-span-6">
              <Input
                id="exactKm"
                type="number"
                min={500}
                max={500000}
                step={500}
                placeholder="e.g. 35000"
                value={exactKm || ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setExactKm(isNaN(val) ? 0 : val);
                }}
                className="font-mono text-base font-bold pr-12 bg-background"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-muted-foreground uppercase pointer-events-none">
                KM
              </span>
            </div>

            <div className="sm:col-span-6 px-1">
              <Slider
                value={[Math.min(Math.max(exactKm, 1000), 150000)]}
                min={1000}
                max={150000}
                step={1000}
                onValueChange={([val]) => val && setExactKm(val)}
                className="py-1"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>1,000 km</span>
                <span>75,000 km</span>
                <span>1,50,000+ km</span>
              </div>
            </div>
          </div>

          {/* Quick milestone presets */}
          <div className="pt-1 space-y-1.5">
            <p className="text-[11px] text-muted-foreground font-medium">Quick milestone presets:</p>
            <div className="flex flex-wrap gap-1.5">
              {KM_PRESETS.map((preset) => {
                const isSelected = exactKm === preset.value;
                return (
                  <button
                    type="button"
                    key={preset.value}
                    onClick={() => setExactKm(preset.value)}
                    className={cn(
                      "text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border/70 bg-muted/40 text-foreground hover:bg-muted hover:border-border"
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {errors.kmDrivenRange && (
            <p className="text-xs text-destructive">{errors.kmDrivenRange}</p>
          )}
        </div>

        {/* Fuel & Transmission */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pt-1">
          {/* Fuel Type */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Fuel className="size-3.5 text-muted-foreground" />
              <span>Fuel Type <span className="text-destructive">*</span></span>
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              {FUEL_TYPES.map((fuel) => {
                const selected = fuelType === fuel.id;
                return (
                  <button
                    type="button"
                    key={fuel.id}
                    onClick={() => setFuelType(fuel.id)}
                    className={cn(
                      "rounded-lg border py-2 text-xs font-semibold transition-all",
                      selected
                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    )}
                  >
                    {fuel.label}
                  </button>
                );
              })}
            </div>
            {errors.fuelType && <p className="text-xs text-destructive">{errors.fuelType}</p>}
          </div>

          {/* Transmission */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Cog className="size-3.5 text-muted-foreground" />
              <span>Transmission <span className="text-destructive">*</span></span>
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              {TRANSMISSIONS.map((trans) => {
                const selected = transmissionType === trans.id;
                return (
                  <button
                    type="button"
                    key={trans.id}
                    onClick={() => setTransmissionType(trans.id)}
                    className={cn(
                      "rounded-lg border py-2 text-xs font-semibold transition-all",
                      selected
                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    )}
                  >
                    {trans.label}
                  </button>
                );
              })}
            </div>
            {errors.transmissionType && (
              <p className="text-xs text-destructive">{errors.transmissionType}</p>
            )}
          </div>
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
          <span>Next: Pricing & Offer</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}
