"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/lib/utils/image";

interface CarGalleryProps {
  title: string;
  images: { id: string; url: string; order: number; isCover: boolean }[];
  coverImage: string;
}

export function CarGallery({ title, images, coverImage }: CarGalleryProps) {
  // Consolidate images
  const allImages =
    images.length > 0
      ? images.map((img) => img.url)
      : [coverImage];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const currentUrl = allImages[currentIndex] ?? coverImage;

  return (
    <div className="space-y-4">
      {/* Main Feature Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-sm group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative h-full w-full cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
          >
            <Image
              src={getOptimizedImageUrl(currentUrl, { width: 1200 })}
              alt={`${title} - Photo ${currentIndex + 1}`}
              fill
              priority={currentIndex === 0}
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Counter Badge */}
        <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
          {currentIndex + 1} / {allImages.length}
        </div>

        {/* Fullscreen Trigger */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-transform hover:scale-105 cursor-pointer"
          aria-label="Enlarge image"
        >
          <Maximize2 className="size-4" />
        </button>

        {/* Left / Right Arrows (shown when > 1 image) */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-black/80 hover:scale-110 cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-black/80 hover:scale-110 cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {allImages.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer",
                currentIndex === idx
                  ? "border-primary ring-2 ring-primary/30 scale-102"
                  : "border-border opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={getOptimizedImageUrl(url, { width: 240 })}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black/95 border-neutral-800 text-white">
          <DialogTitle className="sr-only">{title} Fullscreen Gallery</DialogTitle>
          <div className="relative aspect-[16/10] w-full max-h-[85vh]">
            <Image
              src={getOptimizedImageUrl(currentUrl, { width: 1920 })}
              alt={title}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-7" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-7" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-1 text-xs font-semibold">
              {currentIndex + 1} of {allImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
