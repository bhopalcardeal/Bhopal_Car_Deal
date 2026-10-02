"use server";

import { prisma } from "@/lib/db";
import { fullSellCarFormSchema } from "@/lib/validations/sell-car";
import { z } from "zod";
import { EnquirySource } from "@prisma/client";

// ==========================================
// SELLER LEAD SERVER ACTION
// ==========================================

export async function submitSellerLead(rawData: unknown) {
  try {
    // 1. Validate payload with Zod
    const validation = fullSellCarFormSchema.safeParse(rawData);

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Validation failed";
      return { success: false, error: firstError };
    }

    const data = validation.data;

    // 2. Honeypot check for spam bots
    if (data.hp_website && data.hp_website.trim().length > 0) {
      console.warn("🛡️ [Honeypot Triggered] Blocked bot seller lead submission.");
      return { success: false, error: "Automated submission rejected." };
    }

    // 3. Normalize registration state & WhatsApp number
    const regState = data.registrationState
      ? data.registrationState.toUpperCase().slice(0, 3)
      : data.registrationNumber.slice(0, 2).toUpperCase();

    const whatsapp = data.whatsappSame
      ? data.mobileNumber
      : data.whatsappNumber || data.mobileNumber;

    // 4. Sanitize photos: filter out any browser blob: URLs and upload base64 to Cloudinary
    const sanitizedPhotos: string[] = [];
    for (const photo of data.photos || []) {
      if (!photo || typeof photo !== "string" || photo.startsWith("blob:")) {
        continue;
      }
      if (photo.startsWith("data:image/")) {
        try {
          const { uploadToCloudinary } = await import("@/lib/cloudinary");
          const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          const result = await uploadToCloudinary(
            buffer,
            `${process.env.CLOUDINARY_FOLDER || "bhopal_car_deal"}/leads`
          );
          sanitizedPhotos.push(result.secureUrl);
        } catch (uploadErr) {
          console.error("Failed to upload base64 photo to Cloudinary in server action:", uploadErr);
        }
      } else if (photo.startsWith("http://") || photo.startsWith("https://")) {
        sanitizedPhotos.push(photo);
      }
    }

    // 5. Persist to PostgreSQL database via Prisma
    const lead = await prisma.sellerLead.create({
      data: {
        name: data.name.trim(),
        mobileNumber: data.mobileNumber.trim(),
        whatsappNumber: whatsapp.trim(),
        city: data.city.trim(),
        registrationNumber: data.registrationNumber.toUpperCase().trim(),
        registrationState: regState,
        manufacturingYear: data.manufacturingYear,
        registrationYear: data.registrationYear,
        ownerType: data.ownerType,
        brand: data.brand.trim(),
        modelName: data.modelName.trim(),
        variant: data.variant?.trim() || null,
        kmDrivenRange: data.kmDrivenRange,
        fuelType: data.fuelType,
        transmissionType: data.transmissionType,
        expectedPrice: data.expectedPrice,
        photos: sanitizedPhotos,
        status: "NEW",
      },
    });

    // 5. Generate memorable reference ID for customer confirmation
    const leadRef = `SEL-${lead.id.slice(-6).toUpperCase()}`;

    console.log(`✅ [Seller Lead Created]: Ref ${leadRef} | Car: ${data.brand} ${data.modelName} | Expected: ₹${data.expectedPrice}`);

    return {
      success: true,
      leadId: lead.id,
      leadRef,
    };
  } catch (error) {
    console.error("❌ [Seller Lead Error]:", error);
    return {
      success: false,
      error: "Unable to submit your car details at this moment. Please call our dealership directly.",
    };
  }
}

// ==========================================
// BUYER ENQUIRY SERVER ACTION
// ==========================================

const buyerEnquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  message: z.string().optional().default(""),
  relatedCarId: z.string().optional(),
  source: z.nativeEnum(EnquirySource).optional().default(EnquirySource.CAR_DETAIL),
  hp_website: z.string().max(0).optional().default(""),
});

export type BuyerEnquiryInput = z.infer<typeof buyerEnquirySchema>;

export async function submitBuyerEnquiry(rawData: unknown) {
  try {
    const validation = buyerEnquirySchema.safeParse(rawData);

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Validation failed";
      return { success: false, error: firstError };
    }

    const data = validation.data;

    if (data.hp_website && data.hp_website.trim().length > 0) {
      console.warn("🛡️ [Honeypot Triggered] Blocked bot buyer enquiry.");
      return { success: false, error: "Automated enquiry rejected." };
    }

    const enquiry = await prisma.buyerEnquiry.create({
      data: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        message: data.message?.trim() || null,
        relatedCarId: data.relatedCarId || null,
        source: data.source,
        status: "NEW",
      },
    });

    console.log(`✅ [Buyer Enquiry Created]: ID ${enquiry.id} for Car ${data.relatedCarId ?? "General"}`);

    return {
      success: true,
      enquiryId: enquiry.id,
    };
  } catch (error) {
    console.error("❌ [Buyer Enquiry Error]:", error);
    return {
      success: false,
      error: "Failed to submit enquiry. Please try calling us directly.",
    };
  }
}
