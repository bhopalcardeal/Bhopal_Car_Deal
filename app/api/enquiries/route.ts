import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EnquirySource } from "@prisma/client";
import { buildWhatsAppUrl } from "@/lib/config/contact";
import { z } from "zod";

export const dynamic = "force-dynamic";

const buyerEnquiryApiSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  message: z.string().optional().default(""),
  preferredDate: z.string().optional().default(""),
  relatedCarId: z.string().optional().nullable(),
  source: z.nativeEnum(EnquirySource).optional().default(EnquirySource.CAR_DETAIL),
  hp_website: z.string().max(0, "Bot detected").optional().default(""),
});

// POST /api/enquiries - Handles buyer enquiries and showroom test drive bookings
export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      body = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email") || undefined,
        message: formData.get("message") || undefined,
        preferredDate: formData.get("preferredDate") || undefined,
        relatedCarId: formData.get("relatedCarId") || undefined,
        source: formData.get("source") || undefined,
        hp_website: formData.get("hp_website") || undefined,
      };
    } else {
      body = await req.json();
    }

    const validation = buyerEnquiryApiSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = validation.data;

    // Honeypot spam defense
    if (data.hp_website && data.hp_website.trim().length > 0) {
      console.warn("🛡️ [Honeypot Triggered] Blocked bot buyer enquiry.");
      return NextResponse.json({ error: "Automated submission rejected." }, { status: 400 });
    }

    // Lookup vehicle info if relatedCarId is provided
    let carTitle = "Certified Pre-Owned Showroom Collection";
    if (data.relatedCarId) {
      const car = await prisma.carListing.findUnique({
        where: { id: data.relatedCarId },
        select: { title: true, brand: true, model: true, manufacturingYear: true, price: true },
      });
      if (car) {
        carTitle = car.title;
      }
    }

    const finalMessage = data.preferredDate
      ? `[Preferred Date: ${data.preferredDate}] ${data.message}`
      : data.message;

    // Save to Database
    const enquiry = await prisma.buyerEnquiry.create({
      data: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        message: finalMessage?.trim() || null,
        relatedCarId: data.relatedCarId || null,
        source: data.source,
        status: "NEW",
      },
    });

    const enquiryRef = `ENQ-${enquiry.id.slice(-6).toUpperCase()}`;

    // Construct detailed WhatsApp message breakdown
    let whatsappMessage = "";
    if (data.source === EnquirySource.CAR_DETAIL || data.relatedCarId) {
      whatsappMessage = `*🏎️ TEST DRIVE & VEHICLE ENQUIRY — BHOPAL CAR DEAL*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Enquiry Ref:* ${enquiryRef}

🚘 *VEHICLE OF INTEREST*
• *Car:* ${carTitle}
${data.preferredDate ? `• *Preferred Inspection Date:* ${data.preferredDate}` : ""}

👤 *CUSTOMER DETAILS*
• *Full Name:* ${data.name.trim()}
• *Mobile Number:* ${data.phone.trim()}
${data.email ? `• *Email:* ${data.email.trim()}` : ""}

📝 *NOTES & SPECIAL REQUESTS*
${data.message?.trim() || "Interested in checking vehicle availability and scheduling a showroom test drive."}

━━━━━━━━━━━━━━━━━━━━━━━━━━
Please confirm availability and test drive schedule.`;
    } else {
      whatsappMessage = `*📩 SHOWROOM INQUIRY — BHOPAL CAR DEAL*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Enquiry Ref:* ${enquiryRef}

👤 *CUSTOMER DETAILS*
• *Full Name:* ${data.name.trim()}
• *Mobile Number:* ${data.phone.trim()}
${data.email ? `• *Email:* ${data.email.trim()}` : ""}

📝 *MESSAGE*
${data.message?.trim() || "Hello Bhopal Car Deal team, I would like more information about your pre-owned inventory."}

━━━━━━━━━━━━━━━━━━━━━━━━━━
Please get in touch with me at your earliest convenience.`;
    }

    const whatsappUrl = buildWhatsAppUrl(whatsappMessage);

    console.log(`✅ [Buyer Enquiry Created in DB]: Ref ${enquiryRef} | Customer: ${data.name} | Phone: ${data.phone}`);

    return NextResponse.json({
      success: true,
      enquiryId: enquiry.id,
      enquiryRef,
      whatsappUrl,
      whatsappMessage,
    });
  } catch (error) {
    console.error("❌ [POST /api/enquiries Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to submit enquiry";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
