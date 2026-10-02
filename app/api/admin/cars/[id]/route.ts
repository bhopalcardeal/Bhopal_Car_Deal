import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { carFormSchema } from "@/lib/validations/car";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getUniqueSlug(baseText: string, currentId: string): Promise<string> {
  let baseSlug = slugify(baseText);
  if (!baseSlug) baseSlug = "car-listing";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.carListing.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// GET /api/admin/cars/[id] - Fetch single car with full specs and admin fields
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const car = await prisma.carListing.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    return NextResponse.json(car);
  } catch (error) {
    console.error("[GET /api/admin/cars/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to fetch car" }, { status: 500 });
  }
}

// PUT /api/admin/cars/[id] - Update car listing
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.carListing.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = carFormSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Generate updated slug only if title has changed
    let slug = existing.slug;
    if (data.title.toLowerCase() !== existing.title.toLowerCase()) {
      slug = await getUniqueSlug(data.title, id);
    }

    let discountPercent: number | null = null;
    if (data.discountedPrice && data.price > data.discountedPrice) {
      discountPercent = Math.round(((data.price - data.discountedPrice) / data.price) * 100);
    }

    const insuranceValidTill = data.insuranceValidTill
      ? new Date(data.insuranceValidTill)
      : null;

    // Sanitize images: filter out blob URLs and upload base64 to Cloudinary
    const sanitizedImages: { url: string; isCover: boolean }[] = [];
    for (const img of data.images) {
      if (!img.url || img.url.startsWith("blob:")) continue;

      let finalUrl = img.url;
      if (img.url.startsWith("data:image/")) {
        try {
          const { uploadToCloudinary } = await import("@/lib/cloudinary");
          const base64Data = img.url.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          const result = await uploadToCloudinary(
            buffer,
            `${process.env.CLOUDINARY_FOLDER || "bhopal_car_deal"}/inventory`
          );
          finalUrl = result.secureUrl;
        } catch (uploadErr) {
          console.error("Failed to upload base64 car image to Cloudinary:", uploadErr);
          continue;
        }
      }
      sanitizedImages.push({
        url: finalUrl,
        isCover: img.isCover ?? false,
      });
    }

    if (sanitizedImages.length === 0) {
      sanitizedImages.push({
        url: "/images/hero-red-car.jpg",
        isCover: true,
      });
    }

    const coverImage =
      data.coverImage && !data.coverImage.startsWith("blob:")
        ? data.coverImage
        : sanitizedImages[0]?.url || "/images/hero-red-car.jpg";

    // Update car and replace image collection in transaction
    const updatedCar = await prisma.$transaction(async (tx) => {
      // Delete old images
      await tx.carImage.deleteMany({
        where: { carId: id },
      });

      // Update car listing and recreate images
      return tx.carListing.update({
        where: { id },
        data: {
          slug,
          title: data.title,
          brand: data.brand,
          model: data.model,
          variant: data.variant,
          bodyType: data.bodyType,
          manufacturingYear: data.manufacturingYear,
          registrationYear: data.registrationYear,
          registrationState: data.registrationState,
          registrationNumber: data.registrationNumber,
          ownerType: data.ownerType,
          kmDriven: data.kmDriven,
          fuelType: data.fuelType,
          transmission: data.transmission,
          colour: data.colour,
          insuranceStatus: data.insuranceStatus,
          insuranceValidTill,
          price: data.price,
          discountedPrice: data.discountedPrice || null,
          discountPercent,
          description: data.description,
          highlightTags: data.highlightTags,
          status: data.status,
          isFeatured: data.isFeatured,
          isNewArrival: data.isNewArrival,
          coverImage,
          images: {
            create: sanitizedImages.map((img, index) => ({
              url: img.url,
              order: index,
              isCover: img.isCover || (img.url === coverImage),
            })),
          },
        },
        include: {
          images: true,
        },
      });
    });

    // Revalidate public caches
    revalidatePath("/");
    revalidatePath("/cars");
    revalidatePath(`/cars/${existing.slug}`);
    if (slug !== existing.slug) {
      revalidatePath(`/cars/${slug}`);
    }

    return NextResponse.json(updatedCar);
  } catch (error) {
    console.error("[PUT /api/admin/cars/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to update car" }, { status: 500 });
  }
}

// DELETE /api/admin/cars/[id] - Hard delete or archive car
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const car = await prisma.carListing.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    await prisma.carListing.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/cars");
    revalidatePath(`/cars/${car.slug}`);

    return NextResponse.json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/admin/cars/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to delete car" }, { status: 500 });
  }
}
