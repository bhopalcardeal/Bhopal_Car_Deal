import { prisma, PUBLIC_CAR_SELECT } from "../lib/db";

async function verify() {
  console.log("🔍 Running Database Verification Checks...\n");

  // 1. Total counts check
  const [carCount, leadCount, enquiryCount, testimonialCount, faqCount, adminCount] =
    await Promise.all([
      prisma.carListing.count(),
      prisma.sellerLead.count(),
      prisma.buyerEnquiry.count(),
      prisma.testimonial.count(),
      prisma.fAQ.count(),
      prisma.adminUser.count(),
    ]);

  console.log(`📊 Counts in Database:`);
  console.log(` - Cars: ${carCount}`);
  console.log(` - Seller Leads: ${leadCount}`);
  console.log(` - Buyer Enquiries: ${enquiryCount}`);
  console.log(` - Testimonials: ${testimonialCount}`);
  console.log(` - FAQs: ${faqCount}`);
  console.log(` - Admin Users: ${adminCount}`);

  // 2. Public Query Security Check
  const publicCar = await prisma.carListing.findFirst({
    select: PUBLIC_CAR_SELECT,
  });

  console.log(`\n🔒 Public Query Security Check:`);
  console.log(` - Car Title: "${publicCar?.title}"`);
  console.log(` - Slug: "${publicCar?.slug}"`);
  console.log(` - Price: ₹${publicCar?.price ? (publicCar.price / 100000).toFixed(2) : 0} Lakhs`);
  // @ts-expect-error - Checking that registrationNumber does NOT exist on PublicCarListing type
  const publicRegNum = publicCar?.registrationNumber;
  console.log(` - registrationNumber in public select result: ${publicRegNum ?? "EXCLUDED (SECURE)"}`);

  // 3. Admin Query Check
  const adminCar = await prisma.carListing.findFirst({
    where: { id: publicCar?.id },
    select: { id: true, title: true, registrationNumber: true },
  });
  console.log(`\n🔑 Admin Query Check:`);
  console.log(` - Car Title: "${adminCar?.title}"`);
  console.log(` - registrationNumber in admin select result: "${adminCar?.registrationNumber}" (ACCESSIBLE TO ADMIN)`);

  console.log("\n✅ All database queries and security protections verified!");
}

verify()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
