import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { EnquiryStatus, Prisma } from "@prisma/client";

// GET /api/admin/enquiries - List buyer enquiries with filtering & search
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || "";
  const status = searchParams.get("status")?.trim() || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const where: Prisma.BuyerEnquiryWhereInput = {};

  if (status && status !== "ALL") {
    where.status = status as EnquiryStatus;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } },
      { relatedCar: { title: { contains: search, mode: "insensitive" } } },
      { relatedCar: { brand: { contains: search, mode: "insensitive" } } },
    ];
  }

  try {
    const enquiries = await prisma.buyerEnquiry.findMany({
      where,
      include: {
        relatedCar: {
          select: {
            id: true,
            title: true,
            slug: true,
            brand: true,
            price: true,
            discountedPrice: true,
            coverImage: true,
            status: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return NextResponse.json({ enquiries, total: enquiries.length });
  } catch (error) {
    console.error("Error fetching buyer enquiries:", error);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}
