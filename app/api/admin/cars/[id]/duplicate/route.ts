import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// POST /api/admin/cars/[id]/duplicate - Clone existing car listing as DRAFT
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
    const original = await prisma.carListing.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!original) {
      return NextResponse.json({ error: "Original car not found" }, { status: 404 });
    }

    const newSlug = `${original.slug}-copy-${Date.now().toString(36)}`;
    const newTitle = `${original.title} (Copy)`;

    const clonedCar = await prisma.carListing.create({
      data: {
        slug: newSlug,
        title: newTitle,
        brand: original.brand,
        model: original.model,
        variant: original.variant,
        bodyType: original.bodyType,
        manufacturingYear: original.manufacturingYear,
        registrationYear: original.registrationYear,
        registrationState: original.registrationState,
        registrationNumber: `${original.registrationNumber}-COPY`,
        ownerType: original.ownerType,
        kmDriven: original.kmDriven,
        fuelType: original.fuelType,
        transmission: original.transmission,
        colour: original.colour,
        insuranceStatus: original.insuranceStatus,
        insuranceValidTill: original.insuranceValidTill,
        price: original.price,
        discountedPrice: original.discountedPrice,
        discountPercent: original.discountPercent,
        currency: original.currency,
        description: original.description,
        highlightTags: original.highlightTags,
        status: "DRAFT", // Cloned as DRAFT for safe review
        isFeatured: false,
        isNewArrival: false,
        coverImage: original.coverImage,
        createdById: session.user.id || null,
        images: {
          create: original.images.map((img) => ({
            url: img.url,
            order: img.order,
            isCover: img.isCover,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/cars");

    return NextResponse.json(clonedCar, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/cars/[id]/duplicate] Error:", error);
    return NextResponse.json({ error: "Failed to duplicate car" }, { status: 500 });
  }
}
