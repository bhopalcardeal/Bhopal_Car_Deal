import React from "react";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Terms & Conditions | Bhopal Car Deal",
  description: "Terms and conditions governing vehicle reservations and sales at Bhopal Car Deal.",
};

export default async function TermsPage() {
  let page = null;
  try {
    page = await prisma.staticPage.findUnique({
      where: { slug: "terms-and-conditions" },
    });
  } catch (error) {
    console.warn("[TermsPage] Database query warning (using fallback):", error);
  }

  return (
    <main className="min-h-screen py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2 border-b border-border pb-6">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Legal</span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Terms & Conditions</h1>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none text-sm text-muted-foreground space-y-6 leading-relaxed">
          <p>
            {page?.content ??
              "Vehicle reservations, token payments, and purchase agreements are governed by our standard dealership terms."}
          </p>
          <h3 className="text-base font-bold text-foreground pt-4">1. Vehicle Availability & Inspection</h3>
          <p>
            All vehicles listed on the platform are subject to prior sale. We encourage scheduled physical
            inspections and test drives at our showroom. Valid Indian driving licenses are required for all
            test drives.
          </p>
          <h3 className="text-base font-bold text-foreground pt-4">2. Pricing Policy</h3>
          <p>
            All listed prices follow our transparent fixed-price model and include mandatory inspection certification
            and complimentary RC ownership transfer assistance.
          </p>
        </div>
      </div>
    </main>
  );
}
