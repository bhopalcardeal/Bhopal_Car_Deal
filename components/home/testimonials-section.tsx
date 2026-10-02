import React from "react";
import Image from "next/image";
import { Marquee } from "@/components/premium/marquee";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquareQuote, CheckCircle2 } from "lucide-react";

interface TestimonialItem {
  id: string;
  name: string;
  city: string | null;
  photo: string | null;
  quote: string;
  carBought: string;
  rating: number;
}

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-slate-50 border-y border-slate-200/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <Star className="size-3 fill-primary text-primary" />
          <span>Verified Customer Stories</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900">
          What Our Buyers & Sellers Say
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Real feedback from car buyers and sellers across Bhopal, Indore, and Madhya Pradesh.
        </p>
      </div>

      {/* Continuous Marquee on Light Canvas */}
      <div className="relative w-full">
        <Marquee speed="normal" pauseOnHover={true} className="py-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="flex w-[350px] sm:w-[420px] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all shrink-0 text-slate-900"
            >
              <div className="space-y-4">
                {/* Rating Stars & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <MessageSquareQuote className="size-5 text-slate-400" />
                </div>

                <p className="text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author & Vehicle Info */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-full bg-slate-100 ring-2 ring-primary/20">
                    <Image
                      src={
                        t.photo ??
                        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80`
                      }
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-900">{t.name}</p>
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-500">{t.city ?? "Bhopal, MP"}</p>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/10 text-primary font-medium">
                  {t.carBought}
                </Badge>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
