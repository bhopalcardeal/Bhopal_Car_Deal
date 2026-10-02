import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { carFormSchema } from "@/lib/validations/car";
import { CarStatus, Prisma } from "@prisma/client";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getUniqueSlug(baseText: string, excludeId?: string): Promise<string> {
  let baseSlug = slugify(baseText);
  if (!baseSlug) baseSlug = "car-listing";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.carListing.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// GET /api/admin/cars - List cars with pagination & filters
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const search = searchParams.get("search")?.trim() || "";
  const status = searchParams.get("status")?.trim() || "";
  const brand = searchParams.get("brand")?.trim() || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.CarListingWhereInput = {};

  if (status && status !== "ALL") {
    where.status = status as CarStatus;
  }

  if (brand && brand !== "ALL") {
    where.brand = { equals: brand, mode: "insensitive" };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
      { variant: { contains: search, mode: "insensitive" } },
      { registrationNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  // Allowed sort fields
  const allowedSortFields = ["createdAt", "price", "manufacturingYear", "kmDriven", "title"];
  const orderField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  try {
    const [total, cars] = await Promise.all([
      prisma.carListing.count({ where }),
      prisma.carListing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
        include: {
          images: {
            select: {
              id: true,
              url: true,
              order: true,
              isCover: true,
            },
            orderBy: { order: "asc" },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      cars,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/cars] Error:", error);
    return NextResponse.json({ error: "Failed to fetch cars" }, { status: 500 });
  }
}

// POST /api/admin/cars - Create a new car listing
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = carFormSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const data = validated.data;
    const slug = await getUniqueSlug(data.title);

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

    const newCar = await prisma.carListing.create({
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
        createdById: session.user.id || null,
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

    // Revalidate public caches
    revalidatePath("/");
    revalidatePath("/cars");
    revalidatePath(`/cars/${slug}`);

    return NextResponse.json(newCar, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/cars] Error:", error);
    return NextResponse.json({ error: "Failed to create car listing" }, { status: 500 });
  }
}

// PATCH /api/admin/cars - Bulk update status
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { ids, status } = body;

    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json({ error: "Missing ids or status" }, { status: 400 });
    }

    const updated = await prisma.carListing.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    revalidatePath("/");
    revalidatePath("/cars");

    return NextResponse.json({ message: "Bulk update successful", count: updated.count });
  } catch (error) {
    console.error("[PATCH /api/admin/cars] Error:", error);
    return NextResponse.json({ error: "Failed to update cars" }, { status: 500 });
  }
}

// DELETE /api/admin/cars - Bulk delete
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Missing car IDs" }, { status: 400 });
    }

    // Cascade delete handles car_images through Prisma relations
    const deleted = await prisma.carListing.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/");
    revalidatePath("/cars");

    return NextResponse.json({ message: "Cars deleted successfully", count: deleted.count });
  } catch (error) {
    console.error("[DELETE /api/admin/cars] Error:", error);
    return NextResponse.json({ error: "Failed to delete cars" }, { status: 500 });
  }
}
