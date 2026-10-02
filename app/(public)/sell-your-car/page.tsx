import type { Metadata } from "next";
import { SellCarWizard } from "@/components/sell-car/sell-car-wizard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ShieldCheck,
  Zap,
  Banknote,
  FileCheck2,
  Phone,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { buildWhatsAppUrl, getDisplayPhone, getWhatsAppNumber } from "@/lib/config/contact";

export const metadata: Metadata = {
  title: "Sell Your Car Online | Instant Valuation & Best Price - Bhopal Car Deal",
  description:
    "Sell your car with free doorstep evaluation, instant paperless RC transfer, and immediate bank payment at Bhopal Car Deal (Since 2004).",
  openGraph: {
    title: "Sell Your Car at Highest Market Price - Bhopal Car Deal",
    description:
      "Instant data-driven car valuation, expert inspection, and same-day payment guarantee.",
  },
};

const SELLER_FAQS = [
  {
    q: "How is my car's valuation estimated?",
    a: "Our algorithm combines real-time dealership transaction data across Bhopal and Central India, current market demand for your brand/model, manufacturing year, mileage, and condition tiers to calculate a transparent, fair-market valuation range.",
  },
  {
    q: "How fast do I receive payment once we agree on the price?",
    a: "Instantly. Once our specialist completes the doorstep inspection and you accept our final written offer, funds are transferred via IMPS/RTGS directly into your verified bank account before the vehicle leaves your premises.",
  },
  {
    q: "What documents do I need to sell my car?",
    a: "You will need the original RC (Registration Certificate), a copy of your current valid car insurance, valid PUC certificate, two passport-sized photographs, and owner KYC documents (Aadhaar & PAN card). If there is an existing loan, our team assists with bank foreclosure NOC.",
  },
  {
    q: "Who takes care of the RTO ownership transfer (RC Transfer)?",
    a: "Bhopal Car Deal manages 100% of the RTO documentation and ownership transfer process at zero additional cost to you. We provide you with a legally binding Delivery Receipt immediately upon handover.",
  },
  {
    q: "Is the doorstep inspection really 100% free?",
    a: "Yes, completely free with zero obligation. If you choose not to sell after our inspection, you pay nothing.",
  },
];

export default function SellYourCarPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden border-b border-border/80 bg-linear-to-b from-primary/5 via-background to-background py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="size-3.5" />
            <span>Instant Valuation • Same-Day Payment</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
            Sell Your Car At The{" "}
            <span className="text-primary underline decoration-primary/30 decoration-wavy">
              Best Dealership Price
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Skip untrustworthy classifieds and endless lowballers. Get a certified valuation, free doorstep evaluation, and immediate bank transfer.
          </p>

          {/* Quick Value Props */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur-xs">
              <Banknote className="size-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Instant Payment</p>
                <p className="text-[10px] text-muted-foreground">IMPS/RTGS on spot</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur-xs">
              <ShieldCheck className="size-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Free Doorstep</p>
                <p className="text-[10px] text-muted-foreground">150-pt inspection</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur-xs">
              <FileCheck2 className="size-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">100% Free RC</p>
                <p className="text-[10px] text-muted-foreground">Legal handover</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur-xs">
              <Zap className="size-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Top Market Price</p>
                <p className="text-[10px] text-muted-foreground">Transparent appraisal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Wizard Form Container */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <SellCarWizard />
      </section>

      {/* Seller FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <HelpCircle className="size-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Everything You Need to Know About Selling With Us
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {SELLER_FAQS.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`seller-faq-${idx}`}
              className="rounded-2xl border border-border bg-card px-4 sm:px-6"
            >
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-foreground py-4 text-left hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-muted-foreground pb-4 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Assistance Help Banner */}
        <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Prefer speaking directly with our car appraisal desk?
            </h3>
            <p className="text-xs text-muted-foreground">
              Call our senior valuation officer anytime between 9:30 AM to 8:00 PM (Monday – Sunday).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <a
              href={`tel:+${getWhatsAppNumber()}`}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors"
            >
              <Phone className="size-3.5 text-primary" />
              <span>{getDisplayPhone()}</span>
            </a>
            <a
              href={buildWhatsAppUrl("Hi Bhopal Car Deal, I want to sell my car")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
            >
              <MessageSquare className="size-3.5" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
