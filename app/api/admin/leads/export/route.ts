import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CsvColumn, generateCsv } from "@/lib/utils/csv";
import { LeadStatus, Prisma } from "@prisma/client";

type LeadExportRow = Prisma.SellerLeadGetPayload<{
  include: {
    assignedTo: {
      select: { name: true; email: true };
    };
  };
}>;

// GET /api/admin/leads/export - Export seller leads as RFC 4180 CSV
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status")?.trim();
  const status =
    statusParam && statusParam !== "ALL" && Object.values(LeadStatus).includes(statusParam as LeadStatus)
      ? (statusParam as LeadStatus)
      : undefined;

  try {
    const leads = await prisma.sellerLead.findMany({
      where: status ? { status } : undefined,
      include: {
        assignedTo: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const columns: CsvColumn<LeadExportRow>[] = [
      { header: "Lead ID", key: "id" },
      {
        header: "Created Date",
        key: (row) => new Date(row.createdAt).toLocaleDateString("en-IN"),
      },
      { header: "Seller Name", key: "name" },
      { header: "Mobile Number", key: "mobileNumber" },
      { header: "WhatsApp Number", key: (row) => row.whatsappNumber || "" },
      { header: "City", key: "city" },
      { header: "Brand", key: "brand" },
      { header: "Model", key: "modelName" },
      { header: "Variant", key: (row) => row.variant || "" },
      { header: "Mfg Year", key: "manufacturingYear" },
      { header: "Reg Year", key: "registrationYear" },
      { header: "Reg State", key: "registrationState" },
      { header: "Reg Plate (Admin Only)", key: "registrationNumber" },
      { header: "Ownership Tier", key: "ownerType" },
      { header: "Km Range", key: "kmDrivenRange" },
      { header: "Fuel Type", key: "fuelType" },
      { header: "Transmission", key: "transmissionType" },
      { header: "Expected Price (INR)", key: "expectedPrice" },
      { header: "Lead Status", key: "status" },
      { header: "Assigned Staff", key: (row) => row.assignedTo?.name || "" },
      { header: "Internal Notes", key: (row) => row.internalNotes || "" },
      { header: "Converted Car ID", key: (row) => row.convertedCarId || "" },
    ];

    const csvContent = generateCsv(columns, leads);

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="seller-leads-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting leads to CSV:", error);
    return NextResponse.json({ error: "Failed to export leads" }, { status: 500 });
  }
}
