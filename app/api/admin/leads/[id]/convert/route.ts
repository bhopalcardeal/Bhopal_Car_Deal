import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CarBodyType, CarStatus } from "@prisma/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseKmFromRange(rangeStr: string): number {
  if (!rangeStr) return 25000;
  const numbers = rangeStr.replace(/,/g, "").match(/\d+/g);
  if (numbers && numbers.length >= 2) {
    const low = parseInt(numbers[0] || "0", 10);
    const high = parseInt(numbers[1] || "0", 10);
    if (!isNaN(low) && !isNaN(high) && high > 0) {
      return Math.round((low + high) / 2);
    }
  } else if (numbers && numbers.length === 1) {
    const single = parseInt(numbers[0] || "0", 10);
    if (!isNaN(single) && single > 0) {
      return single;
    }
  }
  return 25000;
}

function guessBodyType(modelName: string): CarBodyType {
  const m = modelName.toLowerCase();
  if (m.includes("creta") || m.includes("seltos") || m.includes("fortuner") || m.includes("brezza") || m.includes("scorpio") || m.includes("thar") || m.includes("harrier") || m.includes("nexon") || m.includes("xuv")) {
    return "SUV";
  }
  if (m.includes("swift") || m.includes("i20") || m.includes("baleno") || m.includes("polo") || m.includes("altroz") || m.includes("wagon")) {
    return "HATCHBACK";
  }
  if (m.includes("innova") || m.includes("ertiga") || m.includes("carens") || m.includes("triber") || m.includes("carnival")) {
    return "MUV";
  }
  return "SEDAN";
}

// POST /api/admin/leads/[id]/convert - Converts seller lead to a real CarListing in DRAFT status
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const lead = await prisma.sellerLead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Seller lead not found" }, { status: 404 });
    }

    // If already converted, check if the car still exists in DB
    if (lead.convertedCarId) {
      const existingCar = await prisma.carListing.findUnique({
        where: { id: lead.convertedCarId },
      });
      if (existingCar) {
        return NextResponse.json({
          success: true,
          carId: existingCar.id,
          alreadyConverted: true,
          redirectUrl: `/admin/inventory/${existingCar.id}/edit`,
        });
      }
    }

    // Build vehicle attributes from lead
    const rawTitle = `${lead.manufacturingYear} ${lead.brand} ${lead.modelName} ${lead.variant || ""}`.trim();
    const baseSlug = slugify(rawTitle) || "car-listing";
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;
    const parsedKm = parseKmFromRange(lead.kmDrivenRange);
    const bodyType = guessBodyType(lead.modelName);
    // Filter out any invalid or browser-local blob URLs defensively
    const validPhotos = lead.photos.filter(
      (url) => url && typeof url === "string" && !url.startsWith("blob:") && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/"))
    );
    const defaultCover: string = validPhotos[0] || "/images/hero-red-car.jpg";

    const description = `Certified pre-owned ${lead.brand} ${lead.modelName} ${lead.variant || ""}. Direct acquisition from verified seller ${lead.name} (${lead.city}). Rigorously evaluated with multi-point quality assurance.${
      lead.internalNotes ? `\n\nInspection Notes: ${lead.internalNotes}` : ""
    }`;

    // Execute in transaction: create CarListing, create CarImages, update SellerLead
    const result = await prisma.$transaction(async (tx) => {
      const newCar = await tx.carListing.create({
        data: {
          title: rawTitle,
          slug: uniqueSlug,
          brand: lead.brand,
          model: lead.modelName,
          variant: lead.variant || "Standard",
          bodyType: bodyType,
          manufacturingYear: lead.manufacturingYear,
          registrationYear: lead.registrationYear,
          registrationState: lead.registrationState,
          registrationNumber: lead.registrationNumber,
          ownerType: lead.ownerType,
          kmDriven: parsedKm,
          fuelType: lead.fuelType,
          transmission: lead.transmissionType,
          colour: "White",
          insuranceStatus: "COMPREHENSIVE",
          price: lead.expectedPrice > 0 ? lead.expectedPrice : 450000,
          description: description,
          highlightTags: ["150+ Checkpoints Certified", "Single Owner", "RTO Verified"],
          status: CarStatus.DRAFT,
          isFeatured: false,
          isNewArrival: true,
          coverImage: defaultCover,
          createdById: (session.user as { id?: string })?.id || null,
        },
      });

      // Create CarImage records if seller uploaded valid photos
      if (validPhotos.length > 0) {
        await tx.carImage.createMany({
          data: validPhotos.map((url, index) => ({
            carId: newCar.id,
            url,
            order: index,
            isCover: index === 0,
          })),
        });
      } else {
        await tx.carImage.create({
          data: {
            carId: newCar.id,
            url: defaultCover,
            order: 0,
            isCover: true,
          },
        });
      }

      // Update lead to PURCHASED with convertedCarId
      await tx.sellerLead.update({
        where: { id: lead.id },
        data: {
          convertedCarId: newCar.id,
          status: "PURCHASED",
        },
      });

      return newCar;
    });

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${id}`);
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/dashboard");

    return NextResponse.json({
      success: true,
      carId: result.id,
      redirectUrl: `/admin/inventory/${result.id}/edit`,
    });
  } catch (error) {
    console.error("Error converting lead to listing:", error);
    return NextResponse.json(
      { error: "Failed to convert lead to car listing" },
      { status: 500 }
    );
  }
}
