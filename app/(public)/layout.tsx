import React from "react";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { WhatsAppFloat } from "@/components/public/whatsapp-float";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

