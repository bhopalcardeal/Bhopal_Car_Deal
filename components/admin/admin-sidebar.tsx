"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Car,
  Users,
  MessageSquare,
  ExternalLink,
  LogOut,
  Shield,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Inventory",
    href: "/admin/inventory",
    icon: Car,
  },
  {
    name: "Seller Leads",
    href: "/admin/leads",
    icon: Users,
  },
  {
    name: "Buyer Enquiries",
    href: "/admin/enquiries",
    icon: MessageSquare,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex flex-col justify-between border-r border-slate-200 bg-white text-slate-900 p-4 h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="space-y-6">
        <Link href="/admin/dashboard" className="flex items-center px-1">
          <div className="relative h-11 w-full overflow-hidden rounded-xl bg-black px-2 py-1 border border-slate-200 flex items-center justify-center shadow-xs">
            <Image
              src="/images/logo-horizontal.jpg"
              alt="Bhopal Car Deal Admin"
              width={190}
              height={48}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>
        </Link>

        {/* Quick Add Button */}
        <div className="px-1">
          <Button
            asChild
            className="w-full h-10 rounded-xl bg-primary hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-primary/25 justify-center gap-2 cursor-pointer"
          >
            <Link href="/admin/inventory/new">
              <PlusCircle className="size-4" />
              <span>Add New Car</span>
            </Link>
          </Button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/25 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )}
              >
                <Icon className={cn("size-4", isActive ? "text-white" : "text-slate-500")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="size-3.5 text-slate-400" />
            <span>View Live Showroom</span>
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Public</span>
        </Link>

        {/* Admin Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <Shield className="size-4" />
            </div>
            <div className="overflow-hidden leading-tight">
              <p className="text-xs font-bold text-slate-900 truncate">Bhopal Car Deal</p>
              <p className="text-[10px] text-slate-500 truncate">admin@bhopalcardeal.com</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            title="Sign Out"
            className="size-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
