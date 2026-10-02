"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface HeroGlowProps {
  children?: React.ReactNode;
  className?: string;
  subtle?: boolean;
}

export function HeroGlow({
  children,
  className,
  subtle = false,
}: HeroGlowProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-background py-16 md:py-24",
        className
      )}
    >
      {/* Background ambient automotive red glow */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 blur-[120px]",
          subtle ? "opacity-10 dark:opacity-20" : "opacity-20 dark:opacity-30"
        )}
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
        }}
      />

      {/* Floating secondary accent aura */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0.1, scale: 0.8 }}
        animate={{
          opacity: subtle ? [0.06, 0.15, 0.06] : [0.12, 0.25, 0.12],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -top-20 right-1/4 -z-10 h-[350px] w-[350px] rounded-full blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, hsl(350 89% 55% / 0.5) 0%, transparent 70%)",
        }}
      />

      {/* Subtle luxury grid mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
      />

      {children}
    </div>
  );
}
