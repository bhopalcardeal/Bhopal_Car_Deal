"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Tag,
  WalletCards,
  MapPin,
  Phone,
} from "lucide-react";
import { HeroSearchBar } from "./hero-search-bar";
import { getWhatsAppNumber, getDisplayPhone } from "@/lib/config/contact";

interface HeroSectionProps {
  totalCarsCount: number;
}

const VALUE_PROPS = [
  {
    icon: CheckCircle2,
    title: "Hassle-Free Buying Experience",
    subtitle: "Doorstep test drive & end-to-end paperwork",
  },
  {
    icon: ShieldCheck,
    title: "Verified Cars",
    subtitle: "150+ point inspection & verified history",
  },
  {
    icon: Tag,
    title: "Best Prices & Great Deals",
    subtitle: "Transparent pricing with zero hidden fees",
  },
  {
    icon: WalletCards,
    title: "Easy Finance Options",
    subtitle: "Lowest EMI interest rates & instant sanction",
  },
];

export function HeroSection({ totalCarsCount }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Hardware-accelerated parallax on the background image
  const bgParallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[620px] sm:min-h-[660px] lg:min-h-[720px] flex flex-col justify-between overflow-hidden bg-slate-50 text-slate-900 border-b border-slate-200/80"
    >
      {/* 1. FULL-COVER LUXURY CAR BACKGROUND (Red SUV in Architectural Studio) */}
      <motion.div
        style={{ y: bgParallaxY }}
        className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
      >
        <Image
          src="/images/hero-red-car.jpg"
          alt="Bhopal Car Deal - Certified Luxury Pre-Owned Showroom"
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover object-[70%_center] sm:object-[75%_center] lg:object-[82%_center] xl:object-[85%_center] opacity-90"
        />

        {/* Crisp Light Gradients: ensures 100% legibility for dark typography & search dock */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/98 via-white/90 via-40% sm:via-45% md:via-52% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent via-25% to-white/60 pointer-events-none" />

        {/* Ambient Subtle Crimson Glow behind the vehicle */}
        <div
          aria-hidden="true"
          className="absolute top-1/4 right-[10%] h-[350px] w-[450px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, hsl(350 89% 55% / 0.5) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* 2. FOREGROUND HERO CONTENT (Headline, Subtitle, Quick Search Bar) */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-16 pb-8 flex-1 flex flex-col justify-center">
        <div className="max-w-2xl lg:max-w-3xl space-y-4 lg:space-y-5">
          {/* Trust Badge Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-primary shadow-xs">
            <Sparkles className="size-3.5 fill-primary/40 text-primary" />
            <span>Bhopal&apos;s Trusted Pre-Owned Showroom • Since 2004</span>
          </div>

          {/* Bold Typography: "Drive Your Dream Car Today" */}
          <div className="space-y-0.5">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-slate-900 leading-[1.06]">
              Drive Your <br />
              Dream Car <br />
              <span className="bg-gradient-to-r from-primary via-rose-600 to-rose-500 bg-clip-text text-transparent drop-shadow-xs">
                Today
              </span>
            </h1>
          </div>

          {/* Subtitle: "Quality Pre-Owned Cars | Best Prices | Trusted Deals" */}
          <div className="space-y-1">
            <p className="text-slate-800 font-bold text-sm sm:text-base lg:text-lg tracking-wide flex flex-wrap items-center gap-2">
              <span>Quality Pre-Owned Cars</span>
              <span className="text-primary font-black mx-1">|</span>
              <span>Best Prices</span>
              <span className="text-primary font-black mx-1">|</span>
              <span>Trusted Deals</span>
            </p>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium leading-relaxed">
              Explore {totalCarsCount}+ certified pre-owned luxury and family cars with 100%
              verified paperwork, transparent deals, and instant spot exchange.
            </p>
          </div>

          {/* Floating White Glassmorphic Quick Search Dock */}
          <div className="pt-1.5 w-full max-w-3xl">
            <HeroSearchBar />
          </div>

          {/* Trust Highlights below search dock */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-700 pt-0.5">
            <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs">
              <ShieldCheck className="size-4 text-emerald-600" />
              150+ Point Technical Inspection
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs">
              <MapPin className="size-4 text-primary" />
              Opp. Motia Talab, Near LBS Hospital
            </span>
            <a
              href={`tel:+${getWhatsAppNumber()}`}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 px-2.5 py-1 rounded-lg border border-primary/30 transition-colors font-bold"
            >
              <Phone className="size-3.5" />
              {getDisplayPhone()}
            </a>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM FEATURE BAR: 4 Circular Red Value Props */}
      <div className="relative z-10 w-full border-t border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {VALUE_PROPS.map((prop, idx) => {
              const Icon = prop.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 group p-1 rounded-xl transition-colors hover:bg-slate-50"
                >
                  {/* Circular Red Outline Emblem */}
                  <div className="flex-shrink-0 size-11 sm:size-12 rounded-full border-2 border-primary/40 bg-primary/10 text-primary flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-primary/30">
                    <Icon className="size-5 sm:size-5.5 stroke-[2.2]" />
                  </div>
                  <div className="space-y-0.5">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">
                      {prop.title}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed">
                      {prop.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
