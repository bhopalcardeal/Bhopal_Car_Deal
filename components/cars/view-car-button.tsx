"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewCarButtonProps {
  slug: string;
  isSold: boolean;
  className?: string;
}

export function ViewCarButton({ slug, isSold, className }: ViewCarButtonProps) {
  const router = useRouter();
  const href = `/cars/${slug}`;

  // Aggressive proactive prefetch on hover, touch, or focus so that before the user
  // finishes releasing their click/tap, the full RSC route payload is 100% warmed
  // in Next.js's client router cache.
  const handlePrefetch = () => {
    try {
      router.prefetch(href);
    } catch {
      // Ignore prefetch errors
    }
  };

  return (
    <Button
      asChild
      size="sm"
      variant={isSold ? "outline" : "default"}
      className={cn(
        "gap-1 px-3.5 font-semibold shrink-0 cursor-pointer active:scale-95 transition-transform duration-100",
        isSold &&
          "border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20",
        className
      )}
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
      onFocus={handlePrefetch}
      onPointerEnter={handlePrefetch}
    >
      <Link href={href} prefetch={true}>
        <span>{isSold ? "View (Sold)" : "View"}</span>
        <ChevronRight className="size-3.5" />
      </Link>
    </Button>
  );
}
