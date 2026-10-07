"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewCarButtonProps {
  slug: string;
  isSold: boolean;
  className?: string;
}

export function ViewCarButton({ slug, isSold, className }: ViewCarButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only intercept normal left clicks; allow Ctrl/Cmd/middle click for new tab
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      startTransition(() => {
        router.push(`/cars/${slug}`);
      });
    }
  };

  return (
    <Button
      asChild
      size="sm"
      variant={isSold ? "outline" : "default"}
      className={cn(
        "gap-1 px-3.5 font-semibold shrink-0 cursor-pointer transition-all",
        isSold && "border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20",
        isPending && "opacity-85 pointer-events-none scale-95 ring-2 ring-primary/30",
        className
      )}
    >
      <Link href={`/cars/${slug}`} prefetch={true} onClick={handleClick}>
        {isPending ? (
          <>
            <Loader2 className="size-3.5 animate-spin text-current" />
            <span>Opening...</span>
          </>
        ) : (
          <>
            <span>{isSold ? "View (Sold)" : "View"}</span>
            <ChevronRight className="size-3.5" />
          </>
        )}
      </Link>
    </Button>
  );
}
