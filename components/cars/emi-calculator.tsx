"use client";

import React, { useState, useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { Slider } from "@/components/ui/slider";
import { formatPriceINR } from "@/lib/utils/formatters";
import { Calculator, Sparkles } from "lucide-react";

interface EmiCalculatorProps {
  carPrice: number;
}

// Animated Rolling Number Component using motion spring
function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
      Math.round(current)
    )
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export function EmiCalculator({ carPrice }: EmiCalculatorProps) {
  // State for user adjustable sliders
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [tenureMonths, setTenureMonths] = useState(60);
  const [interestRate, setInterestRate] = useState(9.5);

  const downPaymentAmount = Math.round(carPrice * (downPaymentPercent / 100));
  const loanAmount = Math.max(0, carPrice - downPaymentAmount);

  // Calculate monthly EMI using standard formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const monthlyRate = interestRate / 100 / 12;
  const monthlyEmi =
    loanAmount > 0
      ? Math.round(
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
            (Math.pow(1 + monthlyRate, tenureMonths) - 1)
        )
      : 0;

  const totalPayment = monthlyEmi * tenureMonths;
  const totalInterest = Math.max(0, totalPayment - loanAmount);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calculator className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Interactive EMI Calculator</h3>
            <p className="text-xs text-muted-foreground">Customize your down payment and tenure</p>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Sparkles className="size-3" />
          <span>Tie-up with Leading Banks</span>
        </div>
      </div>

      {/* Main Result Banner with Animated Roll-Up */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-1 sm:text-left sm:flex sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Estimated Monthly Payment
          </span>
          <div className="flex items-baseline justify-center sm:justify-start gap-1 text-3xl sm:text-4xl font-black text-primary">
            <span>₹</span>
            <AnimatedNumber value={monthlyEmi} />
            <span className="text-sm font-semibold text-muted-foreground">/month</span>
          </div>
        </div>

        <div className="text-center sm:text-right pt-2 sm:pt-0 space-y-0.5">
          <p className="text-xs text-muted-foreground">
            Loan Amount: <span className="font-bold text-foreground">{formatPriceINR(loanAmount)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Total Payable: <span className="font-bold text-foreground">{formatPriceINR(totalPayment + downPaymentAmount)}</span>
          </p>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-6 pt-2">
        {/* Slider 1: Down Payment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground uppercase">Down Payment ({downPaymentPercent}%)</span>
            <span className="font-bold text-foreground">{formatPriceINR(downPaymentAmount)}</span>
          </div>
          <Slider
            value={[downPaymentPercent]}
            onValueChange={([val]) => setDownPaymentPercent(val ?? 20)}
            min={10}
            max={60}
            step={5}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>10% ({formatPriceINR(carPrice * 0.1)})</span>
            <span>30%</span>
            <span>60% ({formatPriceINR(carPrice * 0.6)})</span>
          </div>
        </div>

        {/* Slider 2: Tenure */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground uppercase">Loan Duration (Tenure)</span>
            <span className="font-bold text-foreground">{tenureMonths} Months ({tenureMonths / 12} Years)</span>
          </div>
          <Slider
            value={[tenureMonths]}
            onValueChange={([val]) => setTenureMonths(val ?? 60)}
            min={12}
            max={84}
            step={12}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1 Year (12m)</span>
            <span>3 Years (36m)</span>
            <span>5 Years (60m)</span>
            <span>7 Years (84m)</span>
          </div>
        </div>

        {/* Slider 3: Interest Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground uppercase">Indicative Interest Rate</span>
            <span className="font-bold text-foreground">{interestRate.toFixed(2)}% p.a.</span>
          </div>
          <Slider
            value={[interestRate * 100]}
            onValueChange={([val]) => setInterestRate((val ?? 950) / 100)}
            min={800}
            max={1500}
            step={25}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>8.00%</span>
            <span>10.50%</span>
            <span>15.00%</span>
          </div>
        </div>
      </div>

      {/* Breakup Summary Pills */}
      <div className="grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
        <div className="rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Principal</span>
          <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">{formatPriceINR(loanAmount)}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Total Interest</span>
          <p className="text-xs sm:text-sm font-bold text-primary mt-0.5">{formatPriceINR(totalInterest)}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Total Cost</span>
          <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">{formatPriceINR(totalPayment)}</p>
        </div>
      </div>
    </div>
  );
}
