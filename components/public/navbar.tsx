"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Phone,
  MessageSquare,
  Menu,
  ShieldCheck,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { buildWhatsAppUrl, getDisplayPhone, getWhatsAppNumber } from "@/lib/config/contact";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Inventory", href: "/cars" },
  { name: "Sell Your Car", href: "/sell-your-car" },
  { name: "About Us", href: "/#why-us" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
          : "bg-white/90 backdrop-blur-sm border-b border-slate-200/60"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center group py-1" aria-label="Bhopal Car Deal">
          <div className="relative flex items-center">
            <Image
              src="/images/bhopal-car-deal-brand-logo.png"
              alt="Bhopal Car Deal - Verified Pre-Owned Vehicles Since 2004"
              width={210}
              height={58}
              className="h-11 sm:h-12 w-auto object-contain mix-blend-multiply transition-transform duration-200 group-hover:scale-[1.02]"
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "transition-colors",
                  isActive
                    ? "text-primary font-bold"
                    : "text-slate-600 hover:text-primary font-medium"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Direct WhatsApp Action */}
          <a
            href={buildWhatsAppUrl("Hi Bhopal Car Deal, I am inquiring about your pre-owned car collection.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <MessageSquare className="size-3.5 fill-current text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          {/* Quick Call Action */}
          <a
            href={`tel:+${getWhatsAppNumber()}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-primary transition-colors px-2 py-1.5"
          >
            <Phone className="size-3.5 text-primary" />
            <span>{getDisplayPhone()}</span>
          </a>

          <Button asChild size="sm" className="gap-2 bg-primary hover:bg-rose-600 text-white font-semibold">
            <Link href="/cars">
              <Search className="size-3.5" />
              <span>Explore Stock</span>
            </Link>
          </Button>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="flex md:hidden items-center gap-2">
          <Button asChild size="sm" variant="outline" className="h-8 px-2.5">
            <a
              href={buildWhatsAppUrl("Hi Bhopal Car Deal, I am interested in your cars.")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <MessageSquare className="size-4 text-emerald-600 dark:text-emerald-400" />
            </a>
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open Navigation Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-6">
              <SheetHeader className="text-left border-b pb-4 mb-4">
                <SheetTitle className="flex items-center">
                  <div className="relative flex items-center">
                    <Image
                      src="/images/bhopal-car-deal-brand-logo.png"
                      alt="Bhopal Car Deal"
                      width={180}
                      height={50}
                      className="h-10 w-auto object-contain mix-blend-multiply"
                    />
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-4 py-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-base font-medium py-2 transition-colors hover:text-primary",
                      pathname === link.href
                        ? "text-primary font-semibold"
                        : "text-foreground/80"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="border-t border-border pt-6 mt-4 space-y-3">
                  <Button asChild className="w-full justify-center" onClick={() => setIsOpen(false)}>
                    <Link href="/cars">Browse All Inventory</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-center" onClick={() => setIsOpen(false)}>
                    <Link href="/sell-your-car">Sell Your Car (Instant Quote)</Link>
                  </Button>

                  <div className="pt-4 flex flex-col gap-2 text-xs text-muted-foreground border-t border-border/50">
                    <a href={`tel:+${getWhatsAppNumber()}`} className="flex items-center gap-2 hover:text-primary">
                      <Phone className="size-3 text-primary" />
                      <span>Talib Khan: {getDisplayPhone()}</span>
                    </a>
                    <a href="tel:+919926625232" className="flex items-center gap-2 hover:text-primary">
                      <Phone className="size-3 text-primary" />
                      <span>Alternate: 99266 25232</span>
                    </a>
                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <ShieldCheck className="size-3.5" />
                      <span>Motia Talab, Bhopal (M.P.)</span>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
