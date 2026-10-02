import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CsvColumn, generateCsv } from "@/lib/utils/csv";
import { EnquiryStatus, Prisma } from "@prisma/client";

type EnquiryExportRow = Prisma.BuyerEnquiryGetPayload<{
  include: {
    relatedCar: {
      select: {
        title: true;
        brand: true;
        price: true;
      };
    };
  };
}>;

// GET /api/admin/enquiries/export - Export buyer enquiries as RFC 4180 CSV
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status")?.trim();
  const status =
    statusParam && statusParam !== "ALL" && Object.values(EnquiryStatus).includes(statusParam as EnquiryStatus)
      ? (statusParam as EnquiryStatus)
      : undefined;

  try {
    const enquiries = await prisma.buyerEnquiry.findMany({
      where: status ? { status } : undefined,
      include: {
        relatedCar: {
          select: {
            title: true,
            brand: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const columns: CsvColumn<EnquiryExportRow>[] = [
      { header: "Enquiry ID", key: "id" },
      {
        header: "Created Date",
        key: (row) => new Date(row.createdAt).toLocaleDateString("en-IN"),
      },
      { header: "Buyer Name", key: "name" },
      { header: "Phone Number", key: "phone" },
      { header: "Email Address", key: (row) => row.email || "" },
      { header: "Enquiry Source", key: "source" },
      { header: "Enquiry Status", key: "status" },
      { header: "Car Title", key: (row) => row.relatedCar?.title || "General Showroom Inquiry" },
      { header: "Car Brand", key: (row) => row.relatedCar?.brand || "" },
      { header: "Car Price (INR)", key: (row) => (row.relatedCar?.price ? String(row.relatedCar.price) : "") },
      { header: "Buyer Message", key: (row) => row.message || "" },
    ];

    const csvContent = generateCsv(columns, enquiries);

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="buyer-enquiries-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting buyer enquiries to CSV:", error);
    return NextResponse.json({ error: "Failed to export enquiries" }, { status: 500 });
  }
}
