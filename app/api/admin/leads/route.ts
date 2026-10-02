import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { LeadStatus, Prisma } from "@prisma/client";

// GET /api/admin/leads - List seller leads with filtering & search
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

  const where: Prisma.SellerLeadWhereInput = {};

  if (status && status !== "ALL") {
    where.status = status as LeadStatus;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { mobileNumber: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { modelName: { contains: search, mode: "insensitive" } },
      { registrationNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const leads = await prisma.sellerLead.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return NextResponse.json({ leads, total: leads.length });
  } catch (error) {
    console.error("Error fetching seller leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
