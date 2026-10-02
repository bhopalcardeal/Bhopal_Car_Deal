"use client";

import React from "react";
import { motion } from "motion/react";
import { staggerContainer, fadeUp } from "@/lib/motion/variants";
import {
  ShieldCheck,
  CheckCircle,
  FileCheck2,
  BadgePercent,
  Sparkles,
} from "lucide-react";

const TRUST_FEATURES = [
  {
    icon: ShieldCheck,
    title: "Checked By Experts",
    description:
      "Every car undergoes a thorough inspection covering engine health, body panels, electricals, and test drive by experienced technicians.",
    badge: "Quality Certified",
  },
  {
    icon: FileCheck2,
    title: "100% Verified Paper Work",
    description:
      "Complete transparency with verified service records, clear title ownership, and full assistance with R.T.O. and insurance transfer.",
    badge: "Clean Documents",
  },
  {
    icon: BadgePercent,
    title: "Best Value Car Exchange",
    description:
      "Upgrade your current vehicle effortlessly. We provide top market appraisal for your old car with instant exchange benefits.",
    badge: "Sale & Purchase",
  },
  {
    icon: CheckCircle,
    title: "Quick Finance & Insurance",
    description:
      "Tailored loan solutions with minimal documentation, competitive interest rates, and seamless doorstep loan processing.",
    badge: "Easy EMIs",
  },
];

export function TrustSection() {
  return (
    <section id="why-us" className="py-20 sm:py-24 bg-slate-50/70 border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3" />
            <span>The Bhopal Car Deal Advantage</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900">
            Why Bhopal Trusts Us Since 2004
          </h2>
          <p className="text-sm text-slate-600 sm:text-base">
            Serving car buyers and sellers in Bhopal (M.P.) for over 20 years with honesty, verified cars, fair pricing, and complete transfer support.
          </p>
        </div>

        {/* Staggered Scroll-Reveal Feature Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TRUST_FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                      <Icon className="size-6" />
                    </div>
                    <span className="rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
