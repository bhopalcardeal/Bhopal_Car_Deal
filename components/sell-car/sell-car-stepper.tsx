"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SellCarStepperProps {
  currentStep: number;
}

const STEPS = [
  { id: 1, label: "Contact", description: "Your details" },
  { id: 2, label: "Registration", description: "Plate & Year" },
  { id: 3, label: "Car Specs", description: "Make & Model" },
  { id: 4, label: "Valuation", description: "Price & Offer" },
];

export function SellCarStepper({ currentStep }: SellCarStepperProps) {
  // If in confirmation step (step 5), mark all complete
  const activeStep = Math.min(currentStep, 4);

  return (
    <div className="w-full">
      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center text-center">
              {/* Step Circle & Connector */}
              <div className="relative flex items-center justify-center mb-2">
                <div
                  className={cn(
                    "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 text-xs sm:text-sm font-bold transition-all duration-300",
                    isCompleted
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                      : isCurrent
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                      : "border-border bg-muted/60 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4 sm:size-5 stroke-[2.5]" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
              </div>

              {/* Step Labels */}
              <div className="space-y-0.5">
                <p
                  className={cn(
                    "text-xs sm:text-sm font-semibold transition-colors",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                <p className="hidden sm:block text-[11px] text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Track */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{
            width: `${((activeStep - 1) / 3) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
