import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma, PUBLIC_CAR_SELECT } from "@/lib/db";
import { CarGallery } from "@/components/cars/car-gallery";
import { EmiCalculator } from "@/components/cars/emi-calculator";
import { EnquiryModal } from "@/components/cars/enquiry-modal";
import { CarCard } from "@/components/cars/car-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatPriceINR,
  formatKm,
  calculateStartingEmi,
  formatEmiPerMonth,
} from "@/lib/utils/formatters";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Phone,
  MessageSquare,
  Share2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { buildWhatsAppUrl, getWhatsAppNumber } from "@/lib/config/contact";

export const revalidate = 300;

interface CarDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic SEO metadata per car
export async function generateMetadata({
  params,
}: CarDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const car = await prisma.carListing.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      coverImage: true,
      price: true,
    },
  });

  if (!car) {
    return {
      title: "Car Not Found | Bhopal Car Deal",
    };
  }

  return {
    title: `${car.title} | Pre-Owned Cars | Bhopal Car Deal`,
    description: car.description.slice(0, 160),
    openGraph: {
      title: `${car.title} — ${formatPriceINR(car.price)}`,
      description: car.description.slice(0, 160),
      images: [{ url: car.coverImage, width: 1200, height: 630 }],
    },
  };
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { slug } = await params;

  // Query vehicle by unique slug using PUBLIC_CAR_SELECT (protecting PII registration numbers)
  const car = await prisma.carListing.findUnique({
    where: { slug },
    select: PUBLIC_CAR_SELECT,
  });

  if (!car) {
    notFound();
  }

  // Query 3 related cars (same brand or body type)
  const relatedCars = await prisma.carListing.findMany({
    where: {
      status: "LIVE",
      id: { not: car.id },
      OR: [{ brand: car.brand }, { bodyType: car.bodyType }],
    },
    select: PUBLIC_CAR_SELECT,
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const isSold = car.status === "SOLD";
  const finalPrice = car.discountedPrice ?? car.price;
  const startingEmi = calculateStartingEmi(finalPrice);

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out this certified ${car.title} at Bhopal Car Deal: https://bhopalcardeal.com/cars/${car.slug}`
  )}`;

  const whatsappInquiryUrl = buildWhatsAppUrl(
    `Hi Bhopal Car Deal, I would like more information on the ${car.title} (Price: ${formatPriceINR(finalPrice)}).`
  );

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Breadcrumb Navigation Bar */}
      <div className="border-b border-border bg-muted/20 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <Link href="/cars" className="hover:text-foreground">All Cars</Link>
            <ChevronRight className="size-3" />
            <Link href={`/cars?brand=${car.brand}`} className="hover:text-foreground">{car.brand}</Link>
            <ChevronRight className="size-3" />
            <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
              {car.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Top Grid: Gallery (Left 65%) + Purchase Action Card (Right 35%) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Gallery & Overview */}
          <div className="lg:col-span-8 space-y-6">
            <CarGallery
              title={car.title}
              images={car.images}
              coverImage={car.coverImage}
            />

            {/* Quick Benefits Strip */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-2xs">
                <ShieldCheck className="size-5 text-primary shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">150+ Checkpoints</p>
                  <p className="text-muted-foreground text-[11px]">Certified Inspection</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-2xs">
                <Award className="size-5 text-primary shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">12-Month Warranty</p>
                  <p className="text-muted-foreground text-[11px]">Powertrain Covered</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-2xs">
                <CheckCircle2 className="size-5 text-primary shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">Free RC Transfer</p>
                  <p className="text-muted-foreground text-[11px]">100% RTO Processed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sticky Details & Purchase Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              {/* Badges & Title */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {isSold ? (
                    <Badge variant="destructive" className="font-bold uppercase tracking-wider">
                      Sold Out
                    </Badge>
                  ) : car.isNewArrival ? (
                    <Badge variant="featured" className="bg-primary text-primary-foreground font-bold">
                      <Sparkles className="size-3 mr-1" />
                      New Arrival
                    </Badge>
                  ) : car.isFeatured ? (
                    <Badge variant="featured" className="bg-primary/90 text-primary-foreground font-bold">
                      Featured
                    </Badge>
                  ) : null}

                  <span className="rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-semibold">
                    {car.registrationState} RTO
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {car.title}
                </h1>

                {/* Quick specs pill row */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
                  <span className="rounded-md bg-muted px-2 py-1 font-medium">{formatKm(car.kmDriven)}</span>
                  {car.fuelType && (
                    <>
                      <span>•</span>
                      <span className="rounded-md bg-muted px-2 py-1 font-medium capitalize">{car.fuelType.toLowerCase()}</span>
                    </>
                  )}
                  {car.transmission && (
                    <>
                      <span>•</span>
                      <span className="rounded-md bg-muted px-2 py-1 font-medium capitalize">{car.transmission.toLowerCase()}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Pricing Block */}
              <div className="border-t border-b border-border py-4 space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-foreground">
                    {formatPriceINR(finalPrice)}
                  </span>
                  {car.discountedPrice && (
                    <span className="text-base text-muted-foreground line-through">
                      {formatPriceINR(car.price)}
                    </span>
                  )}
                  {car.discountPercent && (
                    <Badge variant="success" className="bg-emerald-600 text-white font-bold text-xs">
                      {car.discountPercent}% OFF
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Fixed Price • Zero Hidden Charges
                  </span>
                  <span className="text-muted-foreground">
                    EMI from <strong className="text-foreground">{formatEmiPerMonth(startingEmi)}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <EnquiryModal
                  carId={car.id}
                  carTitle={car.title}
                  carPrice={finalPrice}
                  triggerVariant="default"
                  triggerText="Book a Test Drive"
                />

                <div className="grid grid-cols-2 gap-2.5">
                  <Button asChild variant="outline" className="gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    <a href={whatsappInquiryUrl} target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="size-4" />
                      <span>WhatsApp</span>
                    </a>
                  </Button>

                  <Button asChild variant="outline" className="gap-2 text-xs font-semibold">
                    <a href={`tel:+${getWhatsAppNumber()}`}>
                      <Phone className="size-4 text-primary" />
                      <span>Call Now</span>
                    </a>
                  </Button>
                </div>

                <div className="pt-2 text-center">
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="size-3.5" />
                    <span>Share vehicle with family / friend</span>
                  </a>
                </div>
              </div>

              {/* Transparent Price Breakup Summary Block */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-foreground">Price Summary</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Transparent</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Vehicle Resale Amount</span>
                  <span>{formatPriceINR(finalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>RC Ownership Transfer</span>
                  <span className="text-emerald-600 font-medium">Free (Included)</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>150-Point Inspection & Sanitization</span>
                  <span className="text-emerald-600 font-medium">Free (Included)</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-sm">
                  <span>Total On-Road Resale Price</span>
                  <span className="text-primary">{formatPriceINR(finalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Full Specification Table & Description */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 border-t border-border pt-12">
          <div className="lg:col-span-8 space-y-10">
            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Overview & Condition</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {car.description}
              </p>

              {/* Highlight Tags */}
              {car.highlightTags && car.highlightTags.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Special About This Car
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {car.highlightTags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1 font-semibold text-xs">
                        <CheckCircle2 className="size-3.5 mr-1.5 text-primary" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Full Spec Table (PRD 3.2 / 5.1.3) */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Technical Specifications</h2>
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                  <div className="divide-y divide-border text-sm">
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">Make Year</span>
                      <span className="font-semibold text-foreground">{car.manufacturingYear}</span>
                    </div>
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">Registration Year</span>
                      <span className="font-semibold text-foreground">{car.registrationYear}</span>
                    </div>
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">Ownership</span>
                      <span className="font-semibold text-foreground capitalize">
                        {car.ownerType?.toLowerCase() || "First"} Owner
                      </span>
                    </div>
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">KM Driven</span>
                      <span className="font-semibold text-foreground">{formatKm(car.kmDriven)}</span>
                    </div>
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">Fuel Type</span>
                      <span className="font-semibold text-foreground capitalize">
                        {car.fuelType?.toLowerCase() || "Petrol"}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-border text-sm">
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">Transmission</span>
                      <span className="font-semibold text-foreground capitalize">
                        {car.transmission?.toLowerCase() || "Manual"}
                      </span>
                    </div>
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">RTO / Registration</span>
                      <span className="font-semibold text-foreground">{car.registrationState} RTO</span>
                    </div>
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">Insurance Status</span>
                      <span className="font-semibold text-foreground capitalize">
                        {car.insuranceStatus?.toLowerCase() || "Comprehensive"}
                      </span>
                    </div>
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">Colour</span>
                      <span className="font-semibold text-foreground">{car.colour}</span>
                    </div>
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">Body Style</span>
                      <span className="font-semibold text-foreground capitalize">
                        {car.bodyType?.toLowerCase() || "Sedan"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive EMI Calculator Section */}
            <EmiCalculator carPrice={finalPrice} />
          </div>

          {/* Right Column: Trust Guarantee Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-foreground">The Bhopal Car Deal Promise</h3>
              <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Non-Accidental Guarantee:</strong> Chassis and structural integrity verified on laser alignment jigs.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Odometer Integrity:</strong> Service histories pulled directly from manufacturer authorized centers to ensure zero tampering.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Clear Title:</strong> Zero financial encumbrance, no hypothecation locks, and clean legal ownership records.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Similar / Related Cars Carousel / Grid */}
        {relatedCars.length > 0 && (
          <div className="border-t border-border pt-12 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Similar Vehicles You May Like
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Explore other certified {car.brand} {car.bodyType ? `and ${car.bodyType.toLowerCase()}` : ""} stock.
                </p>
              </div>

              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link href={`/cars?bodyType=${car.bodyType}`}>View All Similar</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCars.map((rc) => (
                <CarCard key={rc.id} car={rc} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Action Bar */}
      <aside aria-label="Mobile Actions" className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-xl flex items-center justify-between gap-3">
        <div>
          <span className="text-base font-black text-slate-900 font-mono block">
            {formatPriceINR(finalPrice)}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">
            Certified • Free RC
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs gap-1.5 px-3 h-9 rounded-xl shadow-xs"
          >
            <a href={whatsappInquiryUrl} target="_blank" rel="noopener noreferrer">
              <MessageSquare className="size-4" />
              <span>WhatsApp</span>
            </a>
          </Button>

          <EnquiryModal
            carId={car.id}
            carTitle={car.title}
            carPrice={finalPrice}
            triggerVariant="default"
            triggerText="Test Drive"
          />
        </div>
      </aside>
    </main>
  );
}
