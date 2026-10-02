"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Menu,
  ExternalLink,
  Shield,
  LogOut,
  LayoutDashboard,
  Car,
  Users,
  MessageSquare,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/admin/inventory", icon: Car },
  { name: "Seller Leads", href: "/admin/leads", icon: Users },
  { name: "Buyer Enquiries", href: "/admin/enquiries", icon: MessageSquare },
];

export function AdminHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Derive title from pathname
  let pageTitle = "Dashboard Overview";
  if (pathname.includes("/inventory/new")) pageTitle = "Add New Car Listing";
  else if (pathname.includes("/inventory/") && pathname.includes("/edit")) pageTitle = "Edit Car Listing";
  else if (pathname.includes("/inventory")) pageTitle = "Inventory Management";
  else if (pathname.includes("/leads")) pageTitle = "Seller Leads";
  else if (pathname.includes("/enquiries")) pageTitle = "Buyer Enquiries";

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Mobile Drawer Trigger & Title */}
      <div className="flex items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] bg-white border-slate-200 text-slate-900 p-4">
            <SheetHeader className="pb-4 border-b border-slate-200">
              <SheetTitle>
                <div className="relative h-10 w-[180px] overflow-hidden rounded-xl bg-black px-2 py-1 border border-slate-200 flex items-center justify-center">
                  <Image
                    src="/images/logo-horizontal.jpg"
                    alt="Bhopal Car Deal"
                    width={180}
                    height={40}
                    className="h-8 w-auto object-contain"
                  />
                </div>
              </SheetTitle>
            </SheetHeader>

            <nav className="mt-6 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold",
                      isActive ? "bg-primary text-white font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 pt-4 border-t border-slate-200 space-y-3">
              <Button asChild size="sm" className="w-full bg-primary hover:bg-rose-600 text-white justify-center gap-2">
                <Link href="/admin/inventory/new" onClick={() => setMobileOpen(false)}>
                  <PlusCircle className="size-4" />
                  <span>Add Car</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="w-full border-slate-200 text-slate-700 hover:text-rose-600 hover:bg-rose-50 justify-center gap-2"
              >
                <LogOut className="size-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex border-slate-200 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs gap-1.5"
        >
          <Link href="/" target="_blank">
            <ExternalLink className="size-3.5 text-slate-500" />
            <span>Live Showroom</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="size-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Shield className="size-4" />
          </div>
          <span className="hidden md:inline-block text-xs font-semibold text-slate-700">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
