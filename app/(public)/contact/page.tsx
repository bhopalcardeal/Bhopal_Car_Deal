import React from "react";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
} from "lucide-react";
import { buildWhatsAppUrl, getDisplayPhone, getWhatsAppNumber } from "@/lib/config/contact";

export const metadata = {
  title: "Contact Us & Showroom Location | Bhopal Car Deal",
  description:
    "Visit Bhopal Car Deal showroom near LBS Heart Hospital, In front of Motia Talab, Bhopal. Call our dealership or chat on WhatsApp.",
};

export default function ContactPage() {
  const displayPhone = getDisplayPhone();
  const phoneDigits = getWhatsAppNumber();
  const whatsappUrl = buildWhatsAppUrl(
    "Hi Bhopal Car Deal, I would like to visit your showroom / inquire about pre-owned cars."
  );

  return (
    <main className="min-h-screen bg-slate-50/60 pb-20">
      {/* Breadcrumb Strip */}
      <div className="border-b border-slate-200 bg-white py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3 text-slate-400" />
            <span className="text-slate-900 font-semibold">Contact Us</span>
          </nav>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Visit Our Bhopal Showroom
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Have a question about a certified car, want to schedule a test drive, or need an on-the-spot valuation for your existing car? We are here to help.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Contact Details & WhatsApp Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Showroom Address Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Showroom Address
              </h2>

              <div className="space-y-1 text-sm text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-900 text-base">Bhopal Car Deal</p>
                <p>Shop No. 3 &amp; 4, Near LBS Heart Hospital,</p>
                <p>In front of Motia Talab, Bhopal,</p>
                <p>Madhya Pradesh – 462001</p>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <Clock className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Working Hours</span>
                  <span>Monday – Sunday: 10:00 AM – 9:00 PM</span>
                  <span className="block text-[11px] text-slate-400">Open 7 days a week</span>
                </div>
              </div>
            </div>

            {/* Direct Phone & WhatsApp Callout */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                Call or Chat Directly
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block uppercase">
                      Talib Khan (Founder)
                    </span>
                    <a
                      href={`tel:+${phoneDigits}`}
                      className="font-mono font-bold text-slate-900 text-base hover:text-primary transition-colors"
                    >
                      {displayPhone}
                    </a>
                  </div>
                  <Button asChild size="sm" variant="outline" className="text-xs font-bold">
                    <a href={`tel:+${phoneDigits}`}>Call</a>
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block uppercase">
                      Showroom Desk
                    </span>
                    <a
                      href="tel:+919926625232"
                      className="font-mono font-bold text-slate-900 text-base hover:text-primary transition-colors"
                    >
                      +91 99266 25232
                    </a>
                  </div>
                  <Button asChild size="sm" variant="outline" className="text-xs font-bold">
                    <a href="tel:+919926625232">Call</a>
                  </Button>
                </div>
              </div>

              {/* WhatsApp CTA Button */}
              <div className="pt-2">
                <Button
                  asChild
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold h-12 rounded-xl text-sm gap-2 shadow-md shadow-[#25D366]/25 cursor-pointer"
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="size-5" />
                    <span>Chat on WhatsApp ({displayPhone})</span>
                  </a>
                </Button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Instant response for vehicle specs, photos &amp; test drive bookings
                </p>
              </div>
            </div>

            {/* Quick Trust Strip */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5">
                <ShieldCheck className="size-5 text-primary shrink-0" />
                <span className="font-semibold text-slate-800">150+ Inspection Checkpoints</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5">
                <Award className="size-5 text-primary shrink-0" />
                <span className="font-semibold text-slate-800">12 Months Warranty Included</span>
              </div>
            </div>
          </div>

          {/* Right Column: Send Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Send Us a Direct Message
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in your requirements below and our team will get back to you with certified options.
                </p>
              </div>

              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
