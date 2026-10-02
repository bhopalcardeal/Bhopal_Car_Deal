"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/config/contact";

export function WhatsAppFloat() {
  const [showTooltip, setShowTooltip] = useState(true);

  const defaultMessage =
    "Hi Bhopal Car Deal, I am looking for a certified pre-owned car. Please share details of your latest collection.";
  const whatsappUrl = buildWhatsAppUrl(defaultMessage);

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-5 z-40 flex items-center gap-3">
      {/* Tooltip badge */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs font-semibold py-1.5 px-3 rounded-full shadow-lg border border-slate-200 animate-in fade-in slide-in-from-right-3 duration-300">
          <span>Need help? Chat on WhatsApp</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Bhopal Car Deal on WhatsApp"
        className={cn(
          "relative group size-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95",
          "bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 hover:bg-[#20ba5a]"
        )}
      >
        {/* Radar Pulse Effect */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />

        {/* WhatsApp Icon (lucide MessageSquare or SVG) */}
        <svg
          className="size-7 fill-white relative z-10"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.002.574 1.895.883 2.806.883 3.18 0 5.767-2.587 5.767-5.766.001-3.18-2.585-5.766-5.767-5.766zm9.969 5.766c0 5.503-4.477 9.98-9.97 9.98-1.748 0-3.385-.453-4.819-1.244l-5.211 1.366 1.391-5.077c-.896-1.503-1.401-3.255-1.401-5.025 0-5.503 4.477-9.98 9.97-9.98 5.503 0 9.97 4.477 9.97 9.98z" />
        </svg>
      </a>
    </aside>
  );
}
