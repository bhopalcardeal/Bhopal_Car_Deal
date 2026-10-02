import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { LeadStatus } from "@prisma/client";

// GET /api/admin/leads/[id] - Get lead details
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
    const lead = await prisma.sellerLead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
  }
}

// PATCH /api/admin/leads/[id] - Update status, internal notes, or assignment
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
    const { status, internalNotes, assignedToId } = body;

    const dataToUpdate: {
      status?: LeadStatus;
      internalNotes?: string;
      assignedToId?: string | null;
    } = {};

    if (status) {
      const validStatuses = Object.values(LeadStatus);
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid lead status" }, { status: 400 });
      }
      dataToUpdate.status = status;
    }

    if (internalNotes !== undefined) {
      dataToUpdate.internalNotes = internalNotes;
    }

    if (assignedToId !== undefined) {
      dataToUpdate.assignedToId = assignedToId;
    }

    const updatedLead = await prisma.sellerLead.update({
      where: { id },
      data: dataToUpdate,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${id}`);
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

// DELETE /api/admin/leads/[id] - Delete seller lead
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
    await prisma.sellerLead.delete({
      where: { id },
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
