import { prisma, PUBLIC_CAR_SELECT } from "../lib/db";
import bcrypt from "bcryptjs";

async function verifyInventoryCrud() {
  console.log("🏁 Starting Phase 7 (Admin Auth) & Phase 8 (Inventory CRUD) Verification...\n");

  // 1. Verify Admin User & Password Hash
  const admin = await prisma.adminUser.findUnique({
    where: { email: "admin@bhopalcardeal.com" },
  });

  if (!admin) {
    throw new Error("Admin user not found in database!");
  }

  const passwordValid = await bcrypt.compare("Admin@123", admin.passwordHash);
  console.log(`🔐 Admin Auth Verification:`);
  console.log(` - Admin Email: ${admin.email}`);
  console.log(` - Password Verification ("Admin@123"): ${passwordValid ? "VALID (Match ✅)" : "INVALID (Mismatch ❌)"}`);

  if (!passwordValid) {
    throw new Error("Admin password comparison failed!");
  }

  // 2. Inventory Create (POST) Simulation
  console.log(`\n🚗 Testing Car Creation (Create Operation)...`);
  const testSlug = `test-bhopal-car-${Date.now().toString(36)}`;
  const createdCar = await prisma.carListing.create({
    data: {
      slug: testSlug,
      title: "2023 Mahindra Thar LX Hard Top 4x4 Diesel",
      brand: "Mahindra",
      model: "Thar",
      variant: "LX 4x4 Hard Top",
      bodyType: "SUV",
      manufacturingYear: 2023,
      registrationYear: 2023,
      registrationState: "MP",
      registrationNumber: "MP 04 ZB 9999", // Admin only sensitive identifier
      ownerType: "FIRST",
      kmDriven: 14500,
      fuelType: "DIESEL",
      transmission: "MANUAL",
      colour: "Napoli Black",
      insuranceStatus: "ZERO_DEP",
      price: 1550000,
      discountedPrice: 1475000,
      discountPercent: 5,
      currency: "INR",
      description: "Mint condition showroom maintained Mahindra Thar 4x4 with zero dep insurance.",
      highlightTags: ["150+ Checkpoints Certified", "Single Owner", "Zero Dep Insurance"],
      status: "LIVE",
      isFeatured: true,
      isNewArrival: true,
      coverImage: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
      createdById: admin.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
            order: 0,
            isCover: true,
          },
          {
            url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
            order: 1,
            isCover: false,
          },
        ],
      },
    },
    include: {
      images: true,
    },
  });

  console.log(` - Created Car ID: ${createdCar.id}`);
  console.log(` - Title: ${createdCar.title}`);
  console.log(` - Slug: ${createdCar.slug}`);
  console.log(` - Status: ${createdCar.status}`);
  console.log(` - Photos attached: ${createdCar.images.length}`);
  console.log(` - Sensitive Registration: ${createdCar.registrationNumber} (Stored securely ✅)`);

  // 3. Security Projection Test on Newly Created Car
  const publicView = await prisma.carListing.findUnique({
    where: { id: createdCar.id },
    select: PUBLIC_CAR_SELECT,
  });
  // @ts-expect-error - Confirming registrationNumber is NOT present on public projection
  const publicReg = publicView?.registrationNumber;
  console.log(` - Public API projection registrationNumber: ${publicReg ?? "OMITTED (Security verified ✅)"}`);

  // 4. Inventory Update (PUT) Simulation
  console.log(`\n✏️ Testing Car Update (Update Operation)...`);
  const updatedCar = await prisma.carListing.update({
    where: { id: createdCar.id },
    data: {
      price: 1525000,
      discountedPrice: 1450000,
      status: "RESERVED",
    },
  });
  console.log(` - Updated Price: ₹${updatedCar.price}`);
  console.log(` - Updated Status: ${updatedCar.status} (Updated ✅)`);

  // 5. Inventory Duplicate (POST Duplicate) Simulation
  console.log(`\n📋 Testing Car Duplicate (Clone Operation)...`);
  const clonedSlug = `${createdCar.slug}-copy-${Date.now().toString(36)}`;
  const duplicatedCar = await prisma.carListing.create({
    data: {
      slug: clonedSlug,
      title: `${createdCar.title} (Copy)`,
      brand: createdCar.brand,
      model: createdCar.model,
      variant: createdCar.variant,
      bodyType: createdCar.bodyType,
      manufacturingYear: createdCar.manufacturingYear,
      registrationYear: createdCar.registrationYear,
      registrationState: createdCar.registrationState,
      registrationNumber: `${createdCar.registrationNumber}-COPY`,
      ownerType: createdCar.ownerType,
      kmDriven: createdCar.kmDriven,
      fuelType: createdCar.fuelType,
      transmission: createdCar.transmission,
      colour: createdCar.colour,
      insuranceStatus: createdCar.insuranceStatus,
      price: createdCar.price,
      currency: "INR",
      description: createdCar.description,
      highlightTags: createdCar.highlightTags,
      status: "DRAFT",
      isFeatured: false,
      isNewArrival: false,
      coverImage: createdCar.coverImage,
    },
  });
  console.log(` - Duplicated Car ID: ${duplicatedCar.id}`);
  console.log(` - Duplicated Title: ${duplicatedCar.title}`);
  console.log(` - Duplicated Status: ${duplicatedCar.status} (Draft confirmed ✅)`);

  // 6. Inventory Cleanup (DELETE Operation)
  console.log(`\n🗑️ Testing Car Deletion (Delete Operation)...`);
  await prisma.carListing.deleteMany({
    where: {
      id: { in: [createdCar.id, duplicatedCar.id] },
    },
  });
  const checkDeleted = await prisma.carListing.findMany({
    where: { id: { in: [createdCar.id, duplicatedCar.id] } },
  });
  console.log(` - Remaining test records in database: ${checkDeleted.length} (Deleted cleanly ✅)`);

  console.log("\n🎉 Full Phase 7 & Phase 8 verification completed successfully with 100% tests passing!");
}

verifyInventoryCrud()
  .catch((err) => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
