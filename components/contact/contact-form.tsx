"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, Send, MessageSquare } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedWhatsAppUrl, setSubmittedWhatsAppUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
          message,
          source: "CONTACT_PAGE",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to submit your message. Please call our dealership directly.");
        return;
      }

      setSubmitted(true);

      // Automated WhatsApp Client Redirect (Option D)
      if (data.whatsappUrl) {
        setSubmittedWhatsAppUrl(data.whatsappUrl);
        let newTab: Window | null = null;
        try {
          newTab = window.open(data.whatsappUrl, "_blank");
        } catch {
          newTab = null;
        }

        // If new tab was blocked by browser popup blocker, redirect directly in current window
        if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
          window.location.href = data.whatsappUrl;
        }
      }
    } catch {
      setError("An unexpected error occurred. Please call or WhatsApp us.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center space-y-3">
        <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
        <p className="text-xs text-slate-600 max-w-sm mx-auto">
          Thank you, <strong className="text-slate-900">{name}</strong>. Our team at Bhopal Car Deal will contact you shortly on <strong>+91 {phone}</strong>.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          {submittedWhatsAppUrl && (
            <Button
              asChild
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
            >
              <a href={submittedWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="size-3.5" />
                <span>Open WhatsApp Chat</span>
              </a>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              setName("");
              setPhone("");
              setEmail("");
              setMessage("");
              setSubmittedWhatsAppUrl(null);
            }}
            className="text-xs border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="contact-name" className="text-xs font-semibold text-slate-700">
          Your Full Name *
        </Label>
        <Input
          id="contact-name"
          required
          placeholder="e.g. Rahul Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white border-slate-200 text-slate-900 text-sm h-10 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="contact-phone" className="text-xs font-semibold text-slate-700">
            Mobile Phone Number *
          </Label>
          <Input
            id="contact-phone"
            required
            type="tel"
            maxLength={10}
            placeholder="10-digit number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            className="bg-white border-slate-200 text-slate-900 text-sm h-10 rounded-xl font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-email" className="text-xs font-semibold text-slate-700">
            Email Address (Optional)
          </Label>
          <Input
            id="contact-email"
            type="email"
            placeholder="e.g. rahul@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white border-slate-200 text-slate-900 text-sm h-10 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message" className="text-xs font-semibold text-slate-700">
          How can we help you? *
        </Label>
        <textarea
          id="contact-message"
          required
          rows={4}
          placeholder="e.g. I am looking for a certified Hyundai Creta under ₹9 Lakh / I want to book a physical inspection..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-400"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-rose-600 text-white font-bold h-11 rounded-xl text-sm shadow-md shadow-primary/25 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            Sending Message...
          </>
        ) : (
          <>
            <Send className="size-4 mr-2" />
            Send Enquiry
          </>
        )}
      </Button>
    </form>
  );
}
