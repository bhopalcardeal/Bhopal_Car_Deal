import React from "react";

export const metadata = {
  title: "Refund Policy | Bhopal Car Deal",
  description: "Token refund and booking cancellation policy at Bhopal Car Deal.",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2 border-b border-border pb-6">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Policy</span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Refund & Cancellation Policy</h1>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none text-sm text-muted-foreground space-y-6 leading-relaxed">
          <p>
            At Bhopal Car Deal, we maintain a 100% Refundable Booking policy to ensure buyer confidence.
          </p>
          <h3 className="text-base font-bold text-foreground pt-4">1. 100% Refundable Holding Token</h3>
          <p>
            When you place a holding deposit to reserve a vehicle for 48 hours prior to inspection, the token
            amount is 100% refundable with no cancellation penalties if you decide not to proceed after viewing
            or testing the vehicle.
          </p>
          <h3 className="text-base font-bold text-foreground pt-4">2. Processing Timeframe</h3>
          <p>
            Refund requests are processed back to the original source account within 3 to 5 business days upon
            written or WhatsApp notification to our sales representative.
          </p>
        </div>
      </div>
    </main>
  );
}
