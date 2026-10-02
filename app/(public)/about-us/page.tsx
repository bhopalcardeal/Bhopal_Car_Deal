import React from "react";
import Image from "next/image";
import { prisma } from "@/lib/db";
import {
  ShieldCheck,
  Award,
  MapPin,
  Phone,
  Clock,
  Car,
  FileCheck2,
  BadgePercent,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buildWhatsAppUrl, getDisplayPhone, getWhatsAppNumber } from "@/lib/config/contact";

export const metadata = {
  title: "About Us | Bhopal Car Deal - Pre-Owned Cars Showroom Since 2004",
  description:
    "Learn about Bhopal Car Deal, Bhopal's trusted pre-owned car showroom since 2004 located at Shop No. 3 & 4, Near LBS Hospital, In front of Motia Talab, Bhopal (M.P.).",
};

export default async function AboutUsPage() {
  let page = null;
  try {
    page = await prisma.staticPage.findUnique({
      where: { slug: "about-us" },
    });
  } catch (error) {
    console.warn("[AboutUsPage] Database query warning (using fallback):", error);
  }

  return (
    <main className="min-h-screen py-12 sm:py-20 bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Block */}
        <div className="space-y-4 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>Established Since 2004 • Bhopal (M.P.)</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-foreground">
            About <span className="text-primary">Bhopal Car Deal</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {page?.content ??
              "Bhopal Car Deal is Bhopal’s premier pre-owned car showroom, founded in 2004. Over the last two decades, we have served thousands of satisfied customers across Bhopal, Indore, and Madhya Pradesh with quality certified cars, verified paperwork, and transparent dealings."}
          </p>
        </div>

        {/* Real Showroom Storefront Photo Showcase */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
          <div className="relative aspect-[16/9] w-full bg-muted">
            <Image
              src="/images/showroom-storefront.jpg"
              alt="Bhopal Car Deal Showroom Storefront - Shop No. 3 & 4, Motia Talab, Bhopal"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1000px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 text-white space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                Our Physical Showroom
              </span>
              <p className="text-lg sm:text-2xl font-black">
                Shop No. 3 &amp; 4, Near LBS Heart Hospital, Motia Talab, Bhopal
              </p>
              <p className="text-xs text-white/80">
                Walk-ins welcome 7 days a week (10:00 AM – 9:00 PM)
              </p>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid (From Signboard) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Our Core Pillars &amp; Services
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border p-5 space-y-2.5 bg-card/60">
              <ShieldCheck className="size-6 text-primary" />
              <h3 className="font-bold text-base">Checked By Experts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Comprehensive technical audit covering mechanicals, transmission, engine compression, and electricals.
              </p>
            </div>

            <div className="rounded-2xl border border-border p-5 space-y-2.5 bg-card/60">
              <FileCheck2 className="size-6 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-base">Verified Paper Work</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clear RTO title check, insurance verification, zero challan guarantee, and fast RTO transfer processing.
              </p>
            </div>

            <div className="rounded-2xl border border-border p-5 space-y-2.5 bg-card/60">
              <BadgePercent className="size-6 text-primary" />
              <h3 className="font-bold text-base">Sale, Purchase &amp; Exchange</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seamless car exchange with top valuation for your old vehicle and instantaneous payment options.
              </p>
            </div>

            <div className="rounded-2xl border border-border p-5 space-y-2.5 bg-card/60">
              <Award className="size-6 text-amber-500" />
              <h3 className="font-bold text-base">Easy Finance &amp; Insurance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tie-ups with leading banks and NBFCs for lowest interest rates, minimal documentation, and speedy loan sanctions.
              </p>
            </div>
          </div>
        </div>

        {/* Leadership & Contact Box */}
        <div className="rounded-3xl border border-border bg-muted/40 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Showroom Leadership
              </span>
              <h3 className="text-2xl font-black text-foreground">Talib Khan &amp; Amir Khan</h3>
              <p className="text-xs text-muted-foreground">
                Proprietors &amp; Automotive Consultants • Serving Central India Since 2004
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="gap-2">
                <a href={`tel:+${getWhatsAppNumber()}`}>
                  <Phone className="size-3.5" />
                  <span>Call Talib Khan</span>
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a
                  href={buildWhatsAppUrl("Hi Bhopal Car Deal, I would like to visit the showroom.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Chat on WhatsApp</span>
                </a>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div className="flex items-start gap-2.5">
              <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">Showroom Address</span>
                <span>Shop No. 3 &amp; 4, Near LBS Heart Hospital, In front of Motia Talab, Bhopal (M.P.)</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">Direct Phone Lines</span>
                <span>{getDisplayPhone()} / +91 99266 25232</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">Business Hours</span>
                <span>Monday to Sunday: 10:00 AM – 9:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Button asChild size="lg" className="font-bold px-8 shadow-sm">
            <Link href="/cars">
              <Car className="size-4 mr-2" />
              <span>Browse Certified Cars In Stock</span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
