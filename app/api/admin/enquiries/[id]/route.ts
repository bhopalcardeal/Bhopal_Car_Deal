import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { EnquiryStatus } from "@prisma/client";

// GET /api/admin/enquiries/[id] - Get single buyer enquiry details
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
    const enquiry = await prisma.buyerEnquiry.findUnique({
      where: { id },
      include: {
        relatedCar: {
          select: {
            id: true,
            title: true,
            slug: true,
            brand: true,
            model: true,
            variant: true,
            manufacturingYear: true,
            price: true,
            discountedPrice: true,
            coverImage: true,
            kmDriven: true,
            fuelType: true,
            transmission: true,
            status: true,
          },
        },
      },
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ enquiry });
  } catch (error) {
    console.error("Error fetching enquiry:", error);
    return NextResponse.json({ error: "Failed to fetch enquiry" }, { status: 500 });
  }
}

// PATCH /api/admin/enquiries/[id] - Update enquiry status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const validStatuses = Object.values(EnquiryStatus);
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid enquiry status" }, { status: 400 });
    }

    const updatedEnquiry = await prisma.buyerEnquiry.update({
      where: { id },
      data: { status },
      include: {
        relatedCar: {
          select: {
            id: true,
            title: true,
            slug: true,
            brand: true,
            price: true,
            coverImage: true,
            status: true,
          },
        },
      },
    });

    revalidatePath("/admin/enquiries");
    revalidatePath(`/admin/enquiries/${id}`);
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true, enquiry: updatedEnquiry });
  } catch (error) {
    console.error("Error updating enquiry:", error);
    return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
  }
}

// DELETE /api/admin/enquiries/[id] - Delete enquiry
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
    await prisma.buyerEnquiry.delete({
      where: { id },
    });

    revalidatePath("/admin/enquiries");
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    return NextResponse.json({ error: "Failed to delete enquiry" }, { status: 500 });
  }
}
