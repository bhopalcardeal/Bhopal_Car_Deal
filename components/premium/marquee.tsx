"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    setStart(true);
  }, []);

  const speedDuration = {
    slow: "60s",
    normal: "35s",
    fast: "20s",
  }[speed];

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative flex overflow-hidden p-2 [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 gap-4 py-2",
          start && "animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={
          {
            "--marquee-duration": speedDuration,
            animationDirection: direction === "left" ? "normal" : "reverse",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "flex shrink-0 gap-4 py-2",
          start && "animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={
          {
            "--marquee-duration": speedDuration,
            animationDirection: direction === "left" ? "normal" : "reverse",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}
