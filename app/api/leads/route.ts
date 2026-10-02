import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { fullSellCarFormSchema } from "@/lib/validations/sell-car";
import { buildWhatsAppUrl } from "@/lib/config/contact";

export const dynamic = "force-dynamic";

// Maximum allowable file size: 15MB per photo
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
];

// POST /api/leads - Unified endpoint: uploads car photos to Cloudinary and saves seller lead in DB
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // 1. Extract text fields
    const name = (formData.get("name") as string)?.trim() || "";
    const mobileNumber = (formData.get("mobileNumber") as string)?.trim() || "";
    const whatsappSame = formData.get("whatsappSame") === "true";
    const whatsappNumber = (formData.get("whatsappNumber") as string)?.trim() || "";
    const city = (formData.get("city") as string)?.trim() || "Bhopal";
    const registrationNumber = (formData.get("registrationNumber") as string)?.trim().toUpperCase() || "";
    const registrationState = (formData.get("registrationState") as string)?.trim().toUpperCase() || "MP";
    const manufacturingYear = parseInt(formData.get("manufacturingYear") as string, 10);
    const registrationYear = parseInt(formData.get("registrationYear") as string, 10);
    const ownerType = formData.get("ownerType") as "FIRST" | "SECOND" | "THIRD" | "FOURTH_PLUS";
    const brand = (formData.get("brand") as string)?.trim() || "";
    const modelName = (formData.get("modelName") as string)?.trim() || "";
    const variant = (formData.get("variant") as string)?.trim() || "";
    const kmDrivenRange = (formData.get("kmDrivenRange") as string)?.trim() || "35,000 km";
    const fuelType = formData.get("fuelType") as "PETROL" | "DIESEL" | "CNG" | "ELECTRIC" | "HYBRID";
    const transmissionType = formData.get("transmissionType") as "MANUAL" | "AUTOMATIC";
    const expectedPrice = parseInt(formData.get("expectedPrice") as string, 10);
    const hp_website = (formData.get("hp_website") as string)?.trim() || "";

    // 2. Validate payload with Zod
    const validation = fullSellCarFormSchema.safeParse({
      name,
      mobileNumber,
      whatsappSame,
      whatsappNumber,
      city,
      registrationNumber,
      registrationState,
      manufacturingYear,
      registrationYear,
      ownerType,
      brand,
      modelName,
      variant,
      kmDrivenRange,
      fuelType,
      transmissionType,
      expectedPrice,
      photos: [], // Validated separately below
      hp_website,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // 3. Honeypot anti-spam check
    if (hp_website.length > 0) {
      console.warn("🛡️ [Honeypot Triggered] Blocked bot seller lead submission.");
      return NextResponse.json({ error: "Automated submission rejected." }, { status: 400 });
    }

    // 4. Extract and upload image files directly to Cloudinary
    const files = formData.getAll("files") as File[];
    const uploadedCloudinaryUrls: string[] = [];

    // Also support any already-uploaded Cloudinary URLs passed in existingPhotos
    const existingPhotos = formData.getAll("existingPhotos") as string[];
    for (const url of existingPhotos) {
      if (url && typeof url === "string" && !url.startsWith("blob:") && url.startsWith("https://res.cloudinary.com/")) {
        uploadedCloudinaryUrls.push(url);
      }
    }

    if (files && files.length > 0) {
      if (!isCloudinaryConfigured()) {
        console.error("❌ Cloudinary is not configured in .env");
        return NextResponse.json(
          { error: "Image storage is not configured. Please ensure Cloudinary credentials are set in .env." },
          { status: 503 }
        );
      }

      const baseFolder = process.env.CLOUDINARY_FOLDER || "bhopal_car_deal";
      const targetFolder = `${baseFolder}/leads`;
      const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".jfif", ".bmp"];

      for (const file of files) {
        if (!file || typeof file !== "object" || file.size === 0) continue;

        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File "${file.name}" exceeds the 15MB limit.` },
            { status: 400 }
          );
        }

        const ext = file.name.includes(".") ? file.name.substring(file.name.lastIndexOf(".")).toLowerCase() : "";
        const isMimeOk = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
        const isExtOk = ALLOWED_EXTS.includes(ext);

        if (!isMimeOk && !isExtOk) {
          return NextResponse.json(
            { error: `Unsupported file format for "${file.name}". Please upload JPEG, PNG, or WebP photos.` },
            { status: 400 }
          );
        }

        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const uploadResult = await uploadToCloudinary(buffer, targetFolder, file.name);
          uploadedCloudinaryUrls.push(uploadResult.secureUrl);
          console.log(`☁️ [Cloudinary Uploaded]: ${uploadResult.publicId} -> ${uploadResult.secureUrl}`);
        } catch (uploadErr) {
          console.error(`❌ [Cloudinary Upload Failed for ${file.name}]:`, uploadErr);
          return NextResponse.json(
            { error: `Failed to upload image "${file.name}" to Cloudinary. Please check your connection.` },
            { status: 500 }
          );
        }
      }
    }

    // 5. Normalize state & WhatsApp number
    const regState = registrationState
      ? registrationState.toUpperCase().slice(0, 3)
      : registrationNumber.slice(0, 2).toUpperCase();

    const finalWhatsapp = whatsappSame
      ? mobileNumber
      : whatsappNumber || mobileNumber;

    // 6. Save in Supabase PostgreSQL via Prisma with Cloudinary URLs
    const lead = await prisma.sellerLead.create({
      data: {
        name: name.trim(),
        mobileNumber: mobileNumber.trim(),
        whatsappNumber: finalWhatsapp.trim(),
        city: city.trim(),
        registrationNumber: registrationNumber.toUpperCase().trim(),
        registrationState: regState,
        manufacturingYear,
        registrationYear,
        ownerType,
        brand: brand.trim(),
        modelName: modelName.trim(),
        variant: variant?.trim() || null,
        kmDrivenRange,
        fuelType,
        transmissionType,
        expectedPrice,
        photos: uploadedCloudinaryUrls,
        status: "NEW",
      },
    });

    const leadRef = `SEL-${lead.id.slice(-6).toUpperCase()}`;

    const ownerLabel =
      ownerType === "FIRST"
        ? "1st Owner"
        : ownerType === "SECOND"
        ? "2nd Owner"
        : ownerType === "THIRD"
        ? "3rd Owner"
        : "4+ Owners";

    const carTitle = `${manufacturingYear} ${brand} ${modelName}${variant ? ` ${variant}` : ""}`;
    const regYearText =
      registrationYear && registrationYear !== manufacturingYear
        ? ` | Reg Year: ${registrationYear}`
        : "";

    const fuelText =
      fuelType === "PETROL"
        ? "Petrol"
        : fuelType === "DIESEL"
        ? "Diesel"
        : fuelType === "CNG"
        ? "CNG"
        : fuelType === "ELECTRIC"
        ? "Electric"
        : "Hybrid";

    const transText = transmissionType === "AUTOMATIC" ? "Automatic" : "Manual";

    const photoCountText =
      uploadedCloudinaryUrls.length > 0
        ? `${uploadedCloudinaryUrls.length} Photo${uploadedCloudinaryUrls.length > 1 ? "s" : ""} Attached`
        : "Will provide at doorstep inspection";

    const priceLakhText = `₹${(expectedPrice / 100000).toFixed(2)} Lakh`;

    const whatsappMessage = `*🚗 CAR VALUATION REQUEST — BHOPAL CAR DEAL*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Lead Reference ID:* ${leadRef}

👤 *SELLER INFORMATION*
• *Full Name:* ${name}
• *Mobile Phone:* ${mobileNumber}
• *WhatsApp Number:* ${finalWhatsapp}
• *Inspection Location:* ${city}

🚘 *VEHICLE SPECIFICATIONS*
• *Car:* ${carTitle}
• *Make Year:* ${manufacturingYear}${regYearText}
• *RC / Plate No:* ${registrationNumber || "Applied / In Process"}
• *RTO State:* ${regState}
• *Ownership:* ${ownerLabel}
• *Odometer (KM Driven):* ${kmDrivenRange}
• *Fuel Type:* ${fuelText}
• *Transmission:* ${transText}

💰 *VALUATION & ASKING PRICE*
• *Expected Asking Price:* ₹${expectedPrice.toLocaleString("en-IN")} (${priceLakhText})
• *Car Photos:* ${photoCountText}

━━━━━━━━━━━━━━━━━━━━━━━━━━
Please update me on my inspection schedule and final evaluation offer.`;

    const whatsappUrl = buildWhatsAppUrl(whatsappMessage);

    console.log(
      `✅ [Seller Lead Created in DB]: Ref ${leadRef} | Car: ${brand} ${modelName} | Photos saved to Cloudinary: ${uploadedCloudinaryUrls.length}`
    );

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      leadRef,
      photosCount: uploadedCloudinaryUrls.length,
      photos: uploadedCloudinaryUrls,
      whatsappUrl,
      whatsappMessage,
    });
  } catch (error) {
    console.error("❌ [POST /api/leads Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to save car details and photos";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
