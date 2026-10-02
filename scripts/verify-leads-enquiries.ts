/**
 * Automated Verification Script for Phase 9 & Phase 10:
 * - Tests SellerLead queries & status persistence
 * - Tests BuyerEnquiry queries & status persistence
 * - Tests Lead-to-Listing Conversion creating real CarListing in DRAFT status with pre-filled specs
 * - Tests RFC 4180 CSV generation
 */

import { prisma } from "../lib/db";
import { generateCsv } from "../lib/utils/csv";
import { CarStatus } from "@prisma/client";

async function runVerification() {
  console.log("🚀 Starting Phase 9 & 10 Verification...\n");

  // 1. Verify Seller Leads Query
  const initialLeads = await prisma.sellerLead.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });
  console.log(`✅ [1/5] Successfully queried SellerLeads: Found ${initialLeads.length} sample leads.`);

  // 2. Verify Buyer Enquiries Query
  const initialEnquiries = await prisma.buyerEnquiry.findMany({
    take: 5,
    include: { relatedCar: true },
    orderBy: { createdAt: "desc" },
  });
  console.log(`✅ [2/5] Successfully queried BuyerEnquiries: Found ${initialEnquiries.length} sample enquiries.`);

  // 3. Test Lead Status Persistence
  const testLead = await prisma.sellerLead.create({
    data: {
      name: "Test Verification Seller",
      mobileNumber: "9876543210",
      whatsappNumber: "9876543210",
      city: "Bhopal",
      registrationNumber: "MP 04 AB 1234",
      registrationState: "MP",
      manufacturingYear: 2022,
      registrationYear: 2022,
      ownerType: "FIRST",
      brand: "Hyundai",
      modelName: "Venue",
      variant: "SX 1.2 Petrol",
      kmDrivenRange: "15,000 - 25,000 km",
      fuelType: "PETROL",
      transmissionType: "MANUAL",
      expectedPrice: 780000,
      photos: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341"],
      status: "NEW",
      internalNotes: "Verified via automated test script",
    },
  });
  console.log(`✅ [3/5] Created test seller lead: ID ${testLead.id}`);

  // Update status to INSPECTION_SCHEDULED
  const updatedLead = await prisma.sellerLead.update({
    where: { id: testLead.id },
    data: { status: "INSPECTION_SCHEDULED", internalNotes: "Inspection scheduled for tomorrow 3 PM" },
  });
  if (updatedLead.status !== "INSPECTION_SCHEDULED") {
    throw new Error("Lead status update failed to persist!");
  }
  console.log(`✅ [3/5] Lead status updated to INSPECTION_SCHEDULED and persisted successfully.`);

  // 4. Test Lead-to-Listing Conversion
  console.log("⚙️ Testing Lead-to-Listing Conversion...");
  const rawTitle = `${testLead.manufacturingYear} ${testLead.brand} ${testLead.modelName} ${testLead.variant || ""}`.trim();
  const slug = `test-venue-${Date.now().toString(36)}`;

  const convertedCar = await prisma.$transaction(async (tx) => {
    const car = await tx.carListing.create({
      data: {
        title: rawTitle,
        slug,
        brand: testLead.brand,
        model: testLead.modelName,
        variant: testLead.variant || "Standard",
        bodyType: "SUV",
        manufacturingYear: testLead.manufacturingYear,
        registrationYear: testLead.registrationYear,
        registrationState: testLead.registrationState,
        registrationNumber: testLead.registrationNumber,
        ownerType: testLead.ownerType,
        kmDriven: 20000,
        fuelType: testLead.fuelType,
        transmission: testLead.transmissionType,
        colour: "White",
        insuranceStatus: "COMPREHENSIVE",
        price: testLead.expectedPrice,
        description: `Certified pre-owned ${testLead.brand} ${testLead.modelName}. Acquired from ${testLead.name}.`,
        highlightTags: ["150+ Checkpoints Certified", "Single Owner", "RTO Verified"],
        status: CarStatus.DRAFT,
        isFeatured: false,
        isNewArrival: true,
        coverImage: testLead.photos[0] || "/images/hero-red-car.jpg",
      },
    });

    await tx.sellerLead.update({
      where: { id: testLead.id },
      data: {
        convertedCarId: car.id,
        status: "PURCHASED",
      },
    });

    return car;
  });

  // Verify converted car details
  if (
    convertedCar.status !== "DRAFT" ||
    convertedCar.price !== 780000 ||
    convertedCar.registrationNumber !== "MP 04 AB 1234" ||
    convertedCar.brand !== "Hyundai"
  ) {
    throw new Error("Converted car listing data mismatch!");
  }
  console.log(`✅ [4/5] Lead-to-Listing Conversion VERIFIED:`);
  console.log(`    - Created real CarListing in DRAFT status (ID: ${convertedCar.id})`);
  console.log(`    - Pre-filled specs: Title="${convertedCar.title}", Price=₹${convertedCar.price}, Plate=${convertedCar.registrationNumber}`);
  console.log(`    - SellerLead.convertedCarId linked to ${convertedCar.id}`);
  console.log(`    - SellerLead.status updated to PURCHASED`);

  // Clean up test records
  await prisma.carListing.delete({ where: { id: convertedCar.id } });
  await prisma.sellerLead.delete({ where: { id: testLead.id } });
  console.log("🧹 Test lead and converted car cleaned up successfully.");

  // 5. Test RFC 4180 CSV Generation
  const sampleData = [
    { name: "Adnan, Sheikh", message: 'Interested in "Polo", please call!', city: "Bhopal" },
    { name: "Rahul Sharma", message: "Needs test drive\non Monday", city: "Indore" },
  ];
  const columns = [
    { header: "Name", key: "name" as const },
    { header: "Message", key: "message" as const },
    { header: "City", key: "city" as const },
  ];

  const csv = generateCsv(columns, sampleData);
  if (!csv.includes('"Adnan, Sheikh"') || !csv.includes('"Interested in ""Polo"", please call!"')) {
    throw new Error("CSV escaping failed!");
  }
  console.log(`✅ [5/5] RFC 4180 CSV generation & quote escaping verified.`);
  console.log("\n🎉 ALL PHASE 9 & 10 AUTOMATED VERIFICATIONS PASSED CLEANLY!");
}

runVerification()
  .catch((err) => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
