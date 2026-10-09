import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Car,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  CheckCircle2,
} from "lucide-react";
import { getWhatsAppNumber, getDisplayPhone } from "@/lib/config/contact";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 text-card-foreground">
      {/* Top Trust Bar */}
      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">150+ Checkpoint Certified</h4>
                <p className="text-xs text-muted-foreground">Every car thoroughly inspected</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">6-Month Warranty Included</h4>
                <p className="text-xs text-muted-foreground">Powertrain peace of mind</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Free RC Ownership Transfer</h4>
                <p className="text-xs text-muted-foreground">100% RTO paperwork handled</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Car className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Transparent Fixed Pricing</h4>
                <p className="text-xs text-muted-foreground">No hidden charges or haggling</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center group">
              <div className="relative h-14 w-[210px] sm:w-[230px] overflow-hidden rounded-xl bg-black px-2.5 py-1.5 border border-border/80 shadow-xs flex items-center justify-center">
                <Image
                  src="/images/logo-horizontal.jpg"
                  alt="Bhopal Car Deal - Pre-Owned Cars Showroom"
                  width={230}
                  height={60}
                  className="h-11 sm:h-12 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Bhopal&apos;s trusted pre-owned car destination since 2004. Certified quality vehicles, transparent dealings, expert mechanical inspection, hassle-free finance, and complete R.T.O. paperwork.
            </p>
            <div className="space-y-2.5 pt-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Shop No. 3 &amp; 4, Near LBS Heart Hospital, In front of Motia Talab, Bhopal (M.P.)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 text-primary shrink-0" />
                <div className="flex flex-wrap items-center gap-x-2">
                  <a href={`tel:+${getWhatsAppNumber()}`} className="hover:text-foreground font-semibold">
                    Talib Khan: {getDisplayPhone()}
                  </a>
                  <span>/</span>
                  <a href="tel:+919926625232" className="hover:text-foreground font-semibold">
                    99266 25232
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 text-primary shrink-0" />
                <a href="mailto:bhopalcardeal@gmail.com" className="hover:text-foreground">
                  bhopalcardeal@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="size-4 text-primary shrink-0" />
                <span>Mon - Sun: 10:00 AM – 9:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold tracking-wide uppercase">Quick Links</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/cars" className="hover:text-primary transition-colors">
                  All Certified Cars
                </Link>
              </li>
              <li>
                <Link href="/sell-your-car" className="hover:text-primary transition-colors">
                  Sell Your Car
                </Link>
              </li>
              <li>
                <Link href="/cars?bodyType=SUV" className="hover:text-primary transition-colors">
                  Luxury SUVs
                </Link>
              </li>
              <li>
                <Link href="/cars?bodyType=SEDAN" className="hover:text-primary transition-colors">
                  Premium Sedans
                </Link>
              </li>
              {/* <li>
                <Link href="/style-guide" className="hover:text-primary transition-colors">
                  Design System (Dev)
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Popular Brands */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold tracking-wide uppercase">Top Brands</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/cars?brand=BMW" className="hover:text-primary transition-colors">
                  Pre-Owned BMW
                </Link>
              </li>
              <li>
                <Link href="/cars?brand=Mercedes-Benz" className="hover:text-primary transition-colors">
                  Mercedes-Benz Collection
                </Link>
              </li>
              <li>
                <Link href="/cars?brand=Audi" className="hover:text-primary transition-colors">
                  Certified Audi
                </Link>
              </li>
              <li>
                <Link href="/cars?brand=Porsche" className="hover:text-primary transition-colors">
                  Porsche Pre-Owned
                </Link>
              </li>
              <li>
                <Link href="/cars?brand=Toyota" className="hover:text-primary transition-colors">
                  Toyota Fortuner & Innova
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold tracking-wide uppercase">Policies & Trust</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about-us" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="hover:text-primary transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Bhopal Car Deal Pre-Owned Showroom. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>Since 2004</span>
            <span>•</span>
            <span>Shop No. 3 &amp; 4, Motia Talab, Bhopal (M.P.)</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
