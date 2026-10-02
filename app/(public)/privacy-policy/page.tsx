import React from "react";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Privacy Policy | Bhopal Car Deal",
  description: "Privacy policy and data protection commitments of Bhopal Car Deal.",
};

export default async function PrivacyPolicyPage() {
  let page = null;
  try {
    page = await prisma.staticPage.findUnique({
      where: { slug: "privacy-policy" },
    });
  } catch (error) {
    console.warn("[PrivacyPolicyPage] Database query warning (using fallback):", error);
  }

  return (
    <main className="min-h-screen py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2 border-b border-border pb-6">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Compliance</span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Compliant with Information Technology Act, 2000 (India)</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none text-sm text-muted-foreground space-y-6 leading-relaxed">
          <p>
            {page?.content ??
              "At Bhopal Car Deal, we take data privacy seriously in strict adherence to the Information Technology Act, 2000."}
          </p>
          <h3 className="text-base font-bold text-foreground pt-4">1. Collection of Information</h3>
          <p>
            When you submit an enquiry, request a callback, or submit your car details via the &ldquo;Sell Your Car&rdquo;
            form, we collect necessary contact information (name, phone number, email address, city) and
            vehicle specifications.
          </p>
          <h3 className="text-base font-bold text-foreground pt-4">2. Restriction of Sensitive Information</h3>
          <p>
            Registration numbers and contact details are stored securely and accessible solely by verified
            dealership administrative personnel. This information is never exposed through public APIs or
            third-party marketing aggregators.
          </p>
        </div>
      </div>
    </main>
  );
}
